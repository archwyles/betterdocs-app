import axios from "axios";
import { NextResponse, NextRequest } from "next/server";

const API_URL = process.env.API_URL!;

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  try {
    const res = await axios.post(`${API_URL}/api/analyze`, {
      query,
    });
    return NextResponse.json({ response: res.data });
  } catch (error: any) {
    console.error("Error details:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
