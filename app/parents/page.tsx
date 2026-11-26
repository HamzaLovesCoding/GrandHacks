import type { Metadata } from "next";
import Event from "../event";

export const metadata: Metadata = {
  title: "For parents and guardians | GrandHacks",
  description:
    "What families need to know about GrandHacks, a free overnight hackathon for middle and high school students in San Francisco, June 19–20, 2027.",
};

export default function ParentsPage() {
  return <Event page="parents" />;
}
