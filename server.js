import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("TradeStreamPro backend is running");
});

app.post("/read-image", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Read this HVAC material list image and return clean lines only.

Rules:
- Quantity first
- Remove items with quantity 0
- Keep sizes like 6", 10", 12x10, 10x8x8
- Convert taps to saddle collars
- If PVC has no size, make it 3/4" PVC
- No table
- No explanation

Example:
8 6" pipe
2 6" saddle collar
1 3/4" PVC tee`
            },
            {
              type: "input_image",
              image_url: image
            }
          ]
        }
      ]
    });

    res.json({ result: response.output_text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Image reader failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`TradeStreamPro backend running on port ${PORT}`);
});
