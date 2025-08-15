import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export async function generateOpenGraphImage(props = {}) {
  const { title = "frankchiarulli.com" } = props;
  return generateImage(
    <div
      style={{
        padding: 40,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#FFFFFF",
        color: "black",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 40,
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 20,
        }}
      >
        <span
          style={{
            fontFamily: "Merriweather",
            fontStyle: "italic",
            fontSize: 35,
            alignItems: "center",
          }}
        >
          A Blog by frank chiarulli jr.
        </span>
      </div>
      <div
        style={{
          fontSize: 90,
          display: "flex",
          alignItems: "center",
          flex: 1,
          paddingBottom: 30,
        }}
      >
        {title}
      </div>
    </div>,
  );
}

async function generateImage(jsx) {
  return new ImageResponse(jsx, {
    ...size,
    fonts: [
      {
        name: "Montserrat",
        data: await montserratExtraBold,
        style: "normal",
        weight: 900,
      },
      {
        name: "Merriweather",
        data: await merriweatherRegular,
        style: "normal",
        weight: 500,
      },
      {
        name: "Merriweather",
        data: await merriweatherItalic,
        style: "italic",
        weight: 500,
      },
    ],
  });
}

const montserratExtraBold = readFile(
  join(process.cwd(), "og/Montserrat-ExtraBold.ttf"),
);
const merriweatherRegular = readFile(
  join(process.cwd(), "og/Merriweather-Regular.ttf"),
);
const merriweatherItalic = readFile(
  join(process.cwd(), "og/Merriweather-Italic.ttf"),
);
