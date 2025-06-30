require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return console.error("❌  MONGODB_URI missing in .env.local");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("netfrix");
  const content = db.collection("content");

  /* ---------- movies ---------- */
  const rootResult = await content.updateMany(
    { driveId: { $exists: true } },
    [
      { $set: { hlsUrl: "$driveId" } },
      { $unset: "driveId" }
    ]
  );
  console.log("🎞️  root docs updated:", rootResult.modifiedCount);

  /* ---------- series episodes ---------- */
  const cursor = content.find({ "seasons.episodes.driveId": { $exists: true } });
  let epCount = 0;
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    let touched = false;
    doc.seasons.forEach(season => {
      season.episodes.forEach(ep => {
        if (ep.driveId && !ep.hlsUrl) {
          ep.hlsUrl = ep.driveId;
          delete ep.driveId;
          touched = true;
          epCount++;
        }
      });
    });
    if (touched) {
      await content.updateOne(
        { _id: doc._id },
        { $set: { seasons: doc.seasons } }
      );
    }
  }
  console.log("📺  nested episodes migrated:", epCount);

  await client.close();
  console.log("✅  driveId ➜ hlsUrl migration complete");
}

migrate().catch(err => {
  console.error("❌  Migration error:", err);
});
