import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Creates a notification document for `toUid`.
 * Silently does nothing if the action-taker is the same as the recipient
 * (e.g. liking / commenting on your own post, or "following" yourself).
 *
 * type: "like" | "follow" | "comment" | "comment_edit"
 */
export async function createNotification({
  toUid,
  fromUser,
  type,
  postId = null,
  preview = "",
}) {
  if (!toUid || !fromUser || toUid === fromUser.uid) return;

  try {
    await addDoc(collection(db, "notifications"), {
      toUid,
      fromUid: fromUser.uid,
      fromName: fromUser.displayName || fromUser.email || "Anonymous User",
      fromPhoto: fromUser.photoURL || "",
      type,
      postId,
      preview: preview ? preview.slice(0, 120) : "",
      read: false,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    // Notifications should never break the primary action (like/comment/follow)
    console.error("Failed to create notification:", err);
  }
}