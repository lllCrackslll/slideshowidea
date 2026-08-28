import { redirect } from "next/navigation";

export default function PublishPage() {
  redirect("/?step=schedule");
}
