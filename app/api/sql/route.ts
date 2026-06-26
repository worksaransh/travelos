import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid query payload." },
        { status: 400 }
      );
    }

    const trimmed = query.trim();
    const lowerTrimmed = trimmed.toLowerCase();

    // 1. Enforce starting with SELECT
    if (!lowerTrimmed.startsWith("select")) {
      return NextResponse.json(
        { success: false, error: "Query rejected. Only SELECT statements are permitted." },
        { status: 400 }
      );
    }

    // 2. Reject key modification/mutation keywords using word boundaries
    const forbiddenKeywords = /\b(insert|update|delete|drop|alter|truncate|create|grant|revoke|replace|merge)\b/i;
    if (forbiddenKeywords.test(lowerTrimmed)) {
      return NextResponse.json(
        { success: false, error: "Query rejected. Contains forbidden database modification keywords." },
        { status: 400 }
      );
    }

    // 3. Execute query on Supabase database
    const { data, error } = await supabase.rpc("execute_read_only_sql", {
      sql_query: trimmed
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      rows: data || []
    });
  } catch (err: any) {
    console.error("SQL query API execution error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
