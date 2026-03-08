#!/usr/bin/env python3
"""
PDF 论文解析器
提取论文内容并生成摘要
"""

import re
import json
from pathlib import Path


def try_extract_pdf_pypdf2(pdf_path):
    """使用 PyPDF2 提取 PDF 文本"""
    try:
        import PyPDF2
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text
    except ImportError:
        return None
    except Exception as e:
        print(f"PyPDF2 错误: {e}")
        return None


def try_extract_pdf_pdfplumber(pdf_path):
    """使用 pdfplumber 提取 PDF 文本"""
    try:
        import pdfplumber
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return text
    except ImportError:
        return None
    except Exception as e:
        print(f"pdfplumber 错误: {e}")
        return None


def try_extract_pdf_pymupdf(pdf_path):
    """使用 PyMuPDF (fitz) 提取 PDF 文本"""
    try:
        import fitz
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    except ImportError:
        return None
    except Exception as e:
        print(f"PyMuPDF 错误: {e}")
        return None


def extract_pdf_text(pdf_path):
    """尝试多种方法提取 PDF 文本"""
    print("正在提取 PDF 文本...")

    # 尝试不同的 PDF 库
    methods = [
        ("PyMuPDF", try_extract_pdf_pymupdf),
        ("pdfplumber", try_extract_pdf_pdfplumber),
        ("PyPDF2", try_extract_pdf_pypdf2),
    ]

    for method_name, method_func in methods:
        try:
            text = method_func(pdf_path)
            if text and len(text) > 100:
                print(f"✅ 使用 {method_name} 成功提取文本")
                return text
        except Exception as e:
            print(f"⚠️ {method_name} 失败: {e}")
            continue

    return None


def extract_metadata(text):
    """提取论文元数据（标题、作者、摘要等）"""
    metadata = {}

    # 尝试提取标题（通常是第一行或标题格式）
    lines = text.split('\n')

    # 查找可能的标题
    for i, line in enumerate(lines[:10]):
        line = line.strip()
        if line and len(line) > 10 and len(line) < 200:
            # 跳过明显的页眉页脚
            if not re.match(r'^\d+$', line) and not re.match(r'^arXiv:', line):
                metadata['title'] = line
                break

    # 尝试提取作者（通常在标题后）
    authors_start = 0
    for i, line in enumerate(lines[1:30]):
        line = line.strip()
        if line and any(keyword in line.lower() for keyword in ['author', 'university', 'institute', 'lab']):
            authors_start = i + 1
            break

    # 查找摘要
    abstract_match = re.search(r'A\s*B\s*S\s*T\s*R\s*A\s*C\s*T\s*[:\n]+(.*?)(?=\n\s*(?:Keywords|Introduction|1\.|I\.))',
                               text, re.IGNORECASE | re.DOTALL)
    if abstract_match:
        metadata['abstract'] = abstract_match.group(1).strip()
    else:
        # 简单的摘要查找
        for i, line in enumerate(lines):
            if 'abstract' in line.lower():
                abstract_lines = []
                j = i + 1
                while j < min(i + 50, len(lines)):
                    curr_line = lines[j].strip()
                    if curr_line and not any(kw in curr_line.lower() for kw in ['keywords', 'introduction', '1.']):
                        abstract_lines.append(curr_line)
                    elif curr_line and any(kw in curr_line.lower() for kw in ['keywords', 'introduction']):
                        break
                    j += 1
                if abstract_lines:
                    metadata['abstract'] = ' '.join(abstract_lines)
                    break

    return metadata


def analyze_structure(text):
    """分析论文结构"""
    structure = {
        'sections': [],
        'total_pages': text.count('\f') + 1
    }

    # 查找章节标题
    section_patterns = [
        r'^(?:\d+\.|[IVX]+\.|\w+)\s+(.+?)(?=\n)',  # 数字或罗马数字开头
        r'^(Abstract|Introduction|Background|Method|Methodology|Results|Discussion|Conclusion|References)(?:\s|$)',
        r'^(Related Work|Literature Review)(?:\s|$)',
    ]

    for pattern in section_patterns:
        matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
        for match in matches:
            if isinstance(match, tuple):
                section = match[0] if match[0] else match[1]
            else:
                section = match
            if section and section not in structure['sections']:
                structure['sections'].append(section)

    return structure


def generate_summary(text, metadata, structure):
    """生成论文摘要"""
    summary = {
        'title': metadata.get('title', '未知标题'),
        'abstract': metadata.get('abstract', '未找到摘要'),
        'structure': structure,
        'main_content': extract_main_ideas(text)
    }
    return summary


def extract_main_ideas(text):
    """提取主要思路和观点"""
    ideas = []

    # 查找主要段落（长段落通常包含重要内容）
    paragraphs = [p.strip() for p in text.split('\n\n') if len(p.strip()) > 100]

    # 提取包含关键词的段落
    keywords = ['propose', 'present', 'introduce', 'demonstrate', 'show', 'method', 'approach',
                'contribution', 'novel', 'framework', 'algorithm', 'result', 'conclusion']

    for para in paragraphs:
        # 检查是否包含关键词
        if any(kw in para.lower() for kw in keywords):
            # 取前500字符作为摘要
            idea = para[:500] + ('...' if len(para) > 500 else '')
            if idea not in ideas:
                ideas.append(idea)
            if len(ideas) >= 10:  # 限制数量
                break

    return ideas


def main():
    """主函数"""
    pdf_path = Path('/Users/rosengong/.openclaw/workspace/vibe_coding_test/paper.pdf')

    print("=" * 60)
    print("  📄 PDF 论文解析器")
    print("=" * 60)

    if not pdf_path.exists():
        print(f"❌ 文件不存在: {pdf_path}")
        return

    # 提取文本
    text = extract_pdf_text(pdf_path)
    if not text:
        print("❌ 无法提取 PDF 文本")
        return

    print(f"✅ 成功提取文本 ({len(text)} 字符)\n")

    # 提取元数据
    print("正在提取元数据...")
    metadata = extract_metadata(text)
    print(f"  标题: {metadata.get('title', '未知')}")
    print(f"  摘要长度: {len(metadata.get('abstract', ''))} 字符\n")

    # 分析结构
    print("正在分析结构...")
    structure = analyze_structure(text)
    print(f"  发现 {len(structure['sections'])} 个章节")
    print(f"  总页数: {structure['total_pages']}\n")

    # 生成摘要
    print("正在生成摘要...")
    summary = generate_summary(text, metadata, structure)

    # 保存结果
    output_path = pdf_path.parent / 'paper_summary.txt'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("=" * 60 + "\n")
        f.write("  📄 论文摘要分析\n")
        f.write("=" * 60 + "\n\n")

        f.write("【标题】\n")
        f.write(summary['title'] + "\n\n")

        f.write("【摘要】\n")
        f.write(summary['abstract'] + "\n\n")

        f.write("【论文结构】\n")
        f.write(f"总页数: {summary['structure']['total_pages']}\n")
        f.write("章节列表:\n")
        for section in summary['structure']['sections']:
            f.write(f"  - {section}\n")
        f.write("\n")

        f.write("【主要思路和观点】\n")
        for i, idea in enumerate(summary['main_content'], 1):
            f.write(f"{i}. {idea}\n\n")

    print(f"✅ 分析完成！结果已保存到: {output_path}")
    print("\n" + "=" * 60)

    # 打印简要摘要到控制台
    print("\n【快速预览】")
    print(f"\n标题: {summary['title']}")
    print(f"\n摘要:\n{summary['abstract'][:500]}...")


if __name__ == "__main__":
    main()
