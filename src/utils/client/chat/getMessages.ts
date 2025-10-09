// utils/chat/groupMessages.ts
import { conversationData, conversationImageObject } from "@/src/types/BaseType";

export interface MessageGroup {
  input_images: conversationImageObject[];
  turns: conversationData[];
}

function getImageKey(images?: conversationImageObject[]): string {
  if (!images || images.length === 0) return "";
  return images
    .map((img) => img.id)
    .sort()
    .join(",");
}

export function groupMessages(messages: conversationData[]): MessageGroup[] {
  if (!messages || messages.length === 0) return [];

  const groups: MessageGroup[] = [];
  let currentGroup: MessageGroup | null = null;

  for (const message of messages) {
    const imageKey = getImageKey(message.input_images);
    const currentKey = currentGroup ? getImageKey(currentGroup.input_images) : null;

    const bothHaveImages =
      (message.input_images?.length ?? 0) > 0 && (currentGroup?.input_images?.length ?? 0) > 0;

    const canMerge = currentGroup !== null && bothHaveImages && imageKey === currentKey;

    if (canMerge) {
      currentGroup?.turns.push(message);
    } else {
      if (currentGroup) groups.push(currentGroup);
      currentGroup = {
        input_images: message.input_images || [],
        turns: [message],
      };
    }
  }

  if (currentGroup) groups.push(currentGroup);

  return groups;
}
