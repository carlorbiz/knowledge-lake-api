import { drive } from "../clients/driveClient.js";
import { Readable } from "stream";

const knowledgeLakeFolderId = process.env.DRIVE_KL_FOLDER_ID;

// Helper to convert string content to a readable stream
function stringToStream(content: string): Readable {
  const stream = new Readable();
  stream.push(content);
  stream.push(null);
  return stream;
}

export const driveTools = [
  // ==================== READ TOOLS ====================
  {
    name: "search_drive",
    description:
      "Search Google Drive for files matching a query. Optionally restrict to the knowledge lake folder.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search terms for file name or full-text.",
        },
        restrictToKnowledgeLake: {
          type: "boolean",
          description: "If true, limit search to the configured folder.",
        },
        pageSize: {
          type: "number",
          description: "Max results (default 10).",
        },
      },
      required: ["query"],
    },
    handler: async (input: {
      query: string;
      restrictToKnowledgeLake?: boolean;
      pageSize?: number;
    }) => {
      const { query, restrictToKnowledgeLake, pageSize = 10 } = input;

      const qParts = [`name contains '${query.replace(/'/g, "\\'")}'`];
      if (restrictToKnowledgeLake && knowledgeLakeFolderId) {
        qParts.push(`'${knowledgeLakeFolderId}' in parents`);
      }
      const q = qParts.join(" and ");

      const res = await drive.files.list({
        q,
        pageSize,
        fields: "files(id, name, mimeType, webViewLink)",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(res.data.files ?? [], null, 2),
          },
        ],
      };
    },
  },
  {
    name: "get_drive_file",
    description:
      "Get metadata and a download link for a Google Drive file by its ID.",
    inputSchema: {
      type: "object" as const,
      properties: {
        fileId: {
          type: "string",
          description: "The file ID from Google Drive.",
        },
      },
      required: ["fileId"],
    },
    handler: async (input: { fileId: string }) => {
      const { fileId } = input;

      const res = await drive.files.get({
        fileId,
        fields: "id, name, mimeType, webViewLink, webContentLink",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(res.data, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "read_drive_file_content",
    description:
      "Read the text content of a file from Google Drive. Works best with text files, markdown, JSON, etc.",
    inputSchema: {
      type: "object" as const,
      properties: {
        fileId: {
          type: "string",
          description: "The file ID to read content from.",
        },
      },
      required: ["fileId"],
    },
    handler: async (input: { fileId: string }) => {
      const { fileId } = input;

      // First get the file metadata to check mime type
      const metadata = await drive.files.get({
        fileId,
        fields: "id, name, mimeType",
      });

      const mimeType = metadata.data.mimeType;

      // For Google Docs, Sheets, etc., we need to export
      if (mimeType?.startsWith("application/vnd.google-apps")) {
        let exportMimeType = "text/plain";
        if (mimeType === "application/vnd.google-apps.document") {
          exportMimeType = "text/markdown";
        } else if (mimeType === "application/vnd.google-apps.spreadsheet") {
          exportMimeType = "text/csv";
        }

        const res = await drive.files.export({
          fileId,
          mimeType: exportMimeType,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: String(res.data),
            },
          ],
        };
      }

      // For regular files, download the content
      const res = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "text" }
      );

      return {
        content: [
          {
            type: "text" as const,
            text: String(res.data),
          },
        ],
      };
    },
  },
  {
    name: "list_drive_folder",
    description: "List files in a specific Google Drive folder.",
    inputSchema: {
      type: "object" as const,
      properties: {
        folderId: {
          type: "string",
          description:
            "The folder ID to list. Use 'root' for My Drive root, or omit to use Knowledge Lake folder.",
        },
        pageSize: {
          type: "number",
          description: "Max results (default 20).",
        },
        orderBy: {
          type: "string",
          description:
            "Sort order (e.g., 'modifiedTime desc', 'name', 'createdTime desc').",
        },
      },
      required: [],
    },
    handler: async (input: {
      folderId?: string;
      pageSize?: number;
      orderBy?: string;
    }) => {
      const {
        folderId = knowledgeLakeFolderId,
        pageSize = 20,
        orderBy = "modifiedTime desc",
      } = input;

      if (!folderId) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Error: No folder ID provided and DRIVE_KL_FOLDER_ID not set.",
            },
          ],
        };
      }

      const res = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        pageSize,
        orderBy,
        fields:
          "files(id, name, mimeType, modifiedTime, createdTime, webViewLink)",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(res.data.files ?? [], null, 2),
          },
        ],
      };
    },
  },

  // ==================== WRITE TOOLS ====================
  {
    name: "create_drive_folder",
    description: "Create a new folder in Google Drive.",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "Name of the new folder.",
        },
        parentFolderId: {
          type: "string",
          description:
            "Parent folder ID. Omit to create in Knowledge Lake folder, use 'root' for My Drive root.",
        },
        description: {
          type: "string",
          description: "Optional description for the folder.",
        },
      },
      required: ["name"],
    },
    handler: async (input: {
      name: string;
      parentFolderId?: string;
      description?: string;
    }) => {
      const { name, parentFolderId = knowledgeLakeFolderId, description } = input;

      const fileMetadata: Record<string, unknown> = {
        name,
        mimeType: "application/vnd.google-apps.folder",
      };

      if (parentFolderId && parentFolderId !== "root") {
        fileMetadata.parents = [parentFolderId];
      }

      if (description) {
        fileMetadata.description = description;
      }

      const res = await drive.files.create({
        requestBody: fileMetadata,
        fields: "id, name, mimeType, webViewLink",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(res.data, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "create_drive_file",
    description:
      "Create a new file in Google Drive with text content. Great for creating markdown, JSON, text files, etc.",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "File name including extension (e.g., 'notes.md', 'data.json').",
        },
        content: {
          type: "string",
          description: "Text content of the file.",
        },
        parentFolderId: {
          type: "string",
          description:
            "Parent folder ID. Omit to create in Knowledge Lake folder.",
        },
        mimeType: {
          type: "string",
          description:
            "MIME type (default: auto-detect from extension). Common types: text/plain, text/markdown, application/json.",
        },
        description: {
          type: "string",
          description: "Optional description for the file.",
        },
      },
      required: ["name", "content"],
    },
    handler: async (input: {
      name: string;
      content: string;
      parentFolderId?: string;
      mimeType?: string;
      description?: string;
    }) => {
      const {
        name,
        content,
        parentFolderId = knowledgeLakeFolderId,
        mimeType,
        description,
      } = input;

      // Auto-detect MIME type from extension if not provided
      let detectedMimeType = mimeType;
      if (!detectedMimeType) {
        const ext = name.split(".").pop()?.toLowerCase();
        const mimeMap: Record<string, string> = {
          md: "text/markdown",
          markdown: "text/markdown",
          txt: "text/plain",
          json: "application/json",
          csv: "text/csv",
          html: "text/html",
          xml: "application/xml",
          yaml: "text/yaml",
          yml: "text/yaml",
        };
        detectedMimeType = mimeMap[ext || ""] || "text/plain";
      }

      const fileMetadata: Record<string, unknown> = {
        name,
      };

      if (parentFolderId && parentFolderId !== "root") {
        fileMetadata.parents = [parentFolderId];
      }

      if (description) {
        fileMetadata.description = description;
      }

      const res = await drive.files.create({
        requestBody: fileMetadata,
        media: {
          mimeType: detectedMimeType,
          body: stringToStream(content),
        },
        fields: "id, name, mimeType, webViewLink, webContentLink",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(res.data, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "update_drive_file",
    description:
      "Update the content of an existing file in Google Drive. Replaces the entire file content.",
    inputSchema: {
      type: "object" as const,
      properties: {
        fileId: {
          type: "string",
          description: "The file ID to update.",
        },
        content: {
          type: "string",
          description: "New text content for the file.",
        },
        newName: {
          type: "string",
          description: "Optional new name for the file.",
        },
        mimeType: {
          type: "string",
          description: "MIME type (default: preserve existing).",
        },
      },
      required: ["fileId", "content"],
    },
    handler: async (input: {
      fileId: string;
      content: string;
      newName?: string;
      mimeType?: string;
    }) => {
      const { fileId, content, newName, mimeType } = input;

      // Get current file info if we need to preserve mime type
      let uploadMimeType = mimeType;
      if (!uploadMimeType) {
        const current = await drive.files.get({
          fileId,
          fields: "mimeType",
        });
        uploadMimeType = current.data.mimeType || "text/plain";
      }

      const requestBody: Record<string, unknown> = {};
      if (newName) {
        requestBody.name = newName;
      }

      const res = await drive.files.update({
        fileId,
        requestBody,
        media: {
          mimeType: uploadMimeType,
          body: stringToStream(content),
        },
        fields: "id, name, mimeType, modifiedTime, webViewLink",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(res.data, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "rename_drive_file",
    description: "Rename a file or folder in Google Drive.",
    inputSchema: {
      type: "object" as const,
      properties: {
        fileId: {
          type: "string",
          description: "The file or folder ID to rename.",
        },
        newName: {
          type: "string",
          description: "The new name.",
        },
      },
      required: ["fileId", "newName"],
    },
    handler: async (input: { fileId: string; newName: string }) => {
      const { fileId, newName } = input;

      const res = await drive.files.update({
        fileId,
        requestBody: { name: newName },
        fields: "id, name, mimeType, webViewLink",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(res.data, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "move_drive_file",
    description: "Move a file or folder to a different parent folder.",
    inputSchema: {
      type: "object" as const,
      properties: {
        fileId: {
          type: "string",
          description: "The file or folder ID to move.",
        },
        newParentId: {
          type: "string",
          description: "The destination folder ID.",
        },
      },
      required: ["fileId", "newParentId"],
    },
    handler: async (input: { fileId: string; newParentId: string }) => {
      const { fileId, newParentId } = input;

      // Get current parents
      const current = await drive.files.get({
        fileId,
        fields: "parents",
      });

      const previousParents = current.data.parents?.join(",") || "";

      const res = await drive.files.update({
        fileId,
        addParents: newParentId,
        removeParents: previousParents,
        fields: "id, name, parents, webViewLink",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(res.data, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "copy_drive_file",
    description: "Create a copy of a file in Google Drive.",
    inputSchema: {
      type: "object" as const,
      properties: {
        fileId: {
          type: "string",
          description: "The file ID to copy.",
        },
        newName: {
          type: "string",
          description: "Name for the copy (optional, defaults to 'Copy of [original]').",
        },
        parentFolderId: {
          type: "string",
          description: "Destination folder ID (optional, defaults to same folder).",
        },
      },
      required: ["fileId"],
    },
    handler: async (input: {
      fileId: string;
      newName?: string;
      parentFolderId?: string;
    }) => {
      const { fileId, newName, parentFolderId } = input;

      const requestBody: Record<string, unknown> = {};
      if (newName) requestBody.name = newName;
      if (parentFolderId) requestBody.parents = [parentFolderId];

      const res = await drive.files.copy({
        fileId,
        requestBody,
        fields: "id, name, mimeType, webViewLink",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(res.data, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "delete_drive_file",
    description:
      "Move a file or folder to trash. Use permanently_delete for permanent deletion.",
    inputSchema: {
      type: "object" as const,
      properties: {
        fileId: {
          type: "string",
          description: "The file or folder ID to delete.",
        },
        permanently: {
          type: "boolean",
          description:
            "If true, permanently delete (skip trash). Default is false (move to trash).",
        },
      },
      required: ["fileId"],
    },
    handler: async (input: { fileId: string; permanently?: boolean }) => {
      const { fileId, permanently = false } = input;

      if (permanently) {
        await drive.files.delete({ fileId });
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: true,
                fileId,
                action: "permanently_deleted",
              }),
            },
          ],
        };
      }

      // Move to trash
      const res = await drive.files.update({
        fileId,
        requestBody: { trashed: true },
        fields: "id, name, trashed",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(res.data, null, 2),
          },
        ],
      };
    },
  },
];
