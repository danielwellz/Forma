import { RequestStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { requestStatusLabelsFa } from "@/lib/constants";

const variantMap: Record<RequestStatus, "secondary" | "warning" | "success" | "outline"> = {
  NEW: "warning",
  IN_REVIEW: "secondary",
  NEEDS_INFO: "warning",
  ESTIMATE_SENT: "success",
  MEETING_SCHEDULED: "secondary",
  WON: "success",
  LOST: "outline",
  ARCHIVED: "outline",
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return <Badge variant={variantMap[status]}>{requestStatusLabelsFa[status]}</Badge>;
}
