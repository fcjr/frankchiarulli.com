module.exports = {
  output: "export",
  trailingSlash: true,
  experimental: {
    viewTransition: true,
  },
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
