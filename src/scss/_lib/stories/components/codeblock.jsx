export const CodeBlock = ({ source }) => {
  return (
    <pre
      style={{ whiteSpace: "pre-line", display: "block" }}
      className="p-30 lh-loose"
      dangerouslySetInnerHTML={{ __html: source }}
    />
  );
};

export default CodeBlock;
