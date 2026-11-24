const isDev = process.env.NODE_ENV === "development";

module.exports = {
  ...(isDev ? {} : { output: "export" }),
  trailingSlash: true,
  pageExtensions: isDev
    ? ["dev.tsx", "dev.ts", "tsx", "ts", "jsx", "js"]
    : ["tsx", "ts", "jsx", "js"],
  async headers() {
    return [
      {
        source: '/opengraph-image',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/png',
          },
          {
            key: 'Content-Disposition',
            value: 'inline',
          },
        ],
      },
      {
        source: '/(.*)/opengraph-image',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/png',
          },
          {
            key: 'Content-Disposition',
            value: 'inline',
          },
        ],
      },
    ];
  },
};
