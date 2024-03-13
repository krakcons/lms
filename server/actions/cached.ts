import { getAuth as baseGetAuth } from "@/server/actions/auth";
import { cache } from "react";

export const getAuth = cache(baseGetAuth);
