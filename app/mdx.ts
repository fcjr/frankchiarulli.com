import * as jsx from "acorn-jsx";
import { Parser } from "acorn";
import { visit } from "unist-util-visit";
import { render as renderPele } from "pele";

const parser = Parser.extend(jsx.default());

const lang = new Set(["js", "jsx", "javascript"]);

export function remarkPeleMermaid() {
  return (tree: any) => {
    visit(tree, "code", (node: any, index: number | undefined, parent: any) => {
      if (node.lang === "mermaid" && parent && typeof index === "number") {
        const { svg } = renderPele(node.value, { fontFamily: "monospace" });
        parent.children.splice(index, 1, {
          type: "mdxJsxFlowElement",
          name: "MermaidDiagram",
          attributes: [
            { type: "mdxJsxAttribute", name: "svg", value: svg },
          ],
          children: [],
        });
      }
    });
  };
}

export function remarkMdxEvalCodeBlock() {
  return (tree: any) => {
    visit(tree, "code", (node: any, index: number, parent: any) => {
      if (lang.has(node.lang) && node.meta === "eval") {
        const program: any = parser.parse(node.value, {
          ecmaVersion: 2020,
          sourceType: "module",
        });
        const output = {
          type: "mdxFlowExpression",
          value: "",
          data: {
            estree: {
              type: "Program",
              body: [
                {
                  type: "ExpressionStatement",
                  expression: {
                    type: "CallExpression",
                    callee: {
                      type: "ArrowFunctionExpression",
                      id: null,
                      expression: false,
                      generator: false,
                      async: false,
                      params: [],
                      body: {
                        type: "BlockStatement",
                        body: [
                          ...program.body.slice(0, -1),
                          {
                            type: "ReturnStatement",
                            argument: program.body.at(-1),
                          },
                        ],
                      },
                    },
                    arguments: [],
                    optional: false,
                  },
                },
              ],
            },
          },
        };
        parent.children.splice(index, 1, output);
      }
    });
  };
}
