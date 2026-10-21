import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { publicStoryWhere } from "@/lib/permissions";

export const runtime = "nodejs";
export const alt = "StoryKeeper AI - Oral History Archive";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const story = await prisma.story.findFirst({
    where: {
      slug,
      ...publicStoryWhere(),
    },
    select: {
      title: true,
      originalLanguage: true,
      region: true,
      timePeriodLabel: true,
      topic: true,
    },
  });

  const title = story?.title || "Oral History Archive Record";
  const language = story?.originalLanguage || "Oral Heritage";
  const region = story?.region || "Community Memory";
  const timePeriod = story?.timePeriodLabel || "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          backgroundColor: "#FBF7F0",
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(227, 163, 59, 0.12) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(181, 71, 43, 0.10) 0%, transparent 40%)",
          fontFamily: "sans-serif",
          color: "#1F1A17",
          border: "16px solid #E4DACB",
        }}
      >
        {/* Top Header Badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                backgroundColor: "#B5472B",
              }}
            />
            <span
              style={{
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "-0.5px",
                color: "#1F1A17",
              }}
            >
              StoryKeeper AI
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "#F3ECE0",
              padding: "8px 20px",
              borderRadius: "9999px",
              border: "1px solid #E4DACB",
            }}
          >
            <span style={{ fontSize: "18px", color: "#6B625A" }}>
              {language} · {region}
            </span>
          </div>
        </div>

        {/* Story Title & Context */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {timePeriod ? (
            <span
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#B5472B",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Circa {timePeriod}
            </span>
          ) : null}
          <h1
            style={{
              fontSize: title.length > 50 ? "46px" : "56px",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#1F1A17",
              margin: 0,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Footer info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #E4DACB",
            paddingTop: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px", color: "#6B625A" }}>
              Oral History & Cultural Archive · Spoken Human Memory
            </span>
          </div>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#3F5B45" }}>
            storykeeper.org
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
