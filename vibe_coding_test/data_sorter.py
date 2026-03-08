#!/usr/bin/env python3
"""
数据排序程序
支持多种排序方式：升序、降序、按数字或字符串排序
"""

import random
import json
from typing import List, Union
from enum import Enum


class SortOrder(Enum):
    ASC = "asc"
    DESC = "desc"


class SortBy(Enum):
    NUMERIC = "numeric"
    STRING = "string"


def generate_sample_data(size: int = 20) -> List[Union[int, str, float]]:
    """生成混合类型的示例数据"""
    data = []

    # 添加一些整数
    for _ in range(size // 4):
        data.append(random.randint(1, 1000))

    # 添加一些浮点数
    for _ in range(size // 4):
        data.append(round(random.uniform(1, 100), 2))

    # 添加一些字符串
    words = ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape",
             "honeydew", "kiwi", "lemon", "mango", "nectarine", "orange", "pear"]
    for _ in range(size // 2):
        data.append(random.choice(words))

    # 混合打乱
    random.shuffle(data)
    return data


def sort_data(data: List, order: SortOrder = SortOrder.ASC, sort_by: SortBy = SortBy.STRING) -> List:
    """
    排序数据

    Args:
        data: 要排序的数据列表
        order: 排序顺序（升序或降序）
        sort_by: 排序依据（数字或字符串）

    Returns:
        排序后的数据列表
    """
    def get_key(item):
        if sort_by == SortBy.NUMERIC:
            # 尝试转换为数字
            try:
                return float(item)
            except (ValueError, TypeError):
                return float('inf')  # 非数字排到最后
        else:
            # 作为字符串排序
            return str(item)

    sorted_data = sorted(data, key=get_key, reverse=(order == SortOrder.DESC))
    return sorted_data


def print_separator(title: str = ""):
    """打印分隔线"""
    if title:
        print(f"\n{'=' * 60}")
        print(f"  {title}")
        print('=' * 60)
    else:
        print('=' * 60)


def main():
    """主函数"""
    print("\n" + "=" * 60)
    print("  📊 数据排序程序")
    print("=" * 60)

    # 生成示例数据
    data = generate_sample_data(20)

    print_separator("📋 原始数据 (20条)")
    for i, item in enumerate(data, 1):
        print(f"  {i:2d}. {item}")

    # 按字符串升序排序
    print_separator("🔤 按字符串升序排序")
    sorted_asc_str = sort_data(data, SortOrder.ASC, SortBy.STRING)
    for i, item in enumerate(sorted_asc_str, 1):
        print(f"  {i:2d}. {item}")

    # 按字符串降序排序
    print_separator("🔤 按字符串降序排序")
    sorted_desc_str = sort_data(data, SortOrder.DESC, SortBy.STRING)
    for i, item in enumerate(sorted_desc_str, 1):
        print(f"  {i:2d}. {item}")

    # 按数字升序排序
    print_separator("🔢 按数字升序排序")
    sorted_asc_num = sort_data(data, SortOrder.ASC, SortBy.NUMERIC)
    for i, item in enumerate(sorted_asc_num, 1):
        print(f"  {i:2d}. {item}")

    # 按数字降序排序
    print_separator("🔢 按数字降序排序")
    sorted_desc_num = sort_data(data, SortOrder.DESC, SortBy.NUMERIC)
    for i, item in enumerate(sorted_desc_num, 1):
        print(f"  {i:2d}. {item}")

    # 保存结果到文件
    print_separator("💾 保存结果到 output.txt")

    output = {
        "original_data": data,
        "sorted_by_string_asc": sorted_asc_str,
        "sorted_by_string_desc": sorted_desc_str,
        "sorted_by_number_asc": sorted_asc_num,
        "sorted_by_number_desc": sorted_desc_num
    }

    with open('output.txt', 'w', encoding='utf-8') as f:
        f.write("=" * 60 + "\n")
        f.write("  数据排序程序 - 输出结果\n")
        f.write("=" * 60 + "\n\n")

        f.write("原始数据:\n")
        for i, item in enumerate(data, 1):
            f.write(f"  {i:2d}. {item}\n")

        f.write("\n按字符串升序:\n")
        for i, item in enumerate(sorted_asc_str, 1):
            f.write(f"  {i:2d}. {item}\n")

        f.write("\n按字符串降序:\n")
        for i, item in enumerate(sorted_desc_str, 1):
            f.write(f"  {i:2d}. {item}\n")

        f.write("\n按数字升序:\n")
        for i, item in enumerate(sorted_asc_num, 1):
            f.write(f"  {i:2d}. {item}\n")

        f.write("\n按数字降序:\n")
        for i, item in enumerate(sorted_desc_num, 1):
            f.write(f"  {i:2d}. {item}\n")

    print("  ✅ 结果已保存到 output.txt")
    print("\n" + "=" * 60)
    print("  程序执行完成！")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
