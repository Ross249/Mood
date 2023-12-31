/**
 * some demo types for testing
 */

export type TreeNode = {
  type: "node";
  value: number;
  name: string;
  children: Tree[];
};
export type TreeLeaf = {
  type: "leaf";
  name: string;
  value: number;
  tooltip: string;
};

export type Tree = TreeNode | TreeLeaf;
