
const ShapFlags = {
  element: 0,
  stateful_component: 0,
  text_children:  0,
  array_children: 0
}
// 不够高效 -> 位运算
// 0000
// 0001 -> element
// 0010 -> stateful
// 0100 -> text_children
// 1000 -> array_children

// 修改 或运算
// 0000 |
// 0001
// 0001

// 查找 与运算
// 0001 &
// 0001
// 0001

// 0010 &
// 0001
// 0000
