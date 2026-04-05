import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Bot, User } from "lucide-react";
import { useSelectedDocument } from "@/context/SelectedDocumentContext";

/* -------------------- TYPES -------------------- */

type Message = {
  sender: "user" | "bot";
  text: string;
};

interface ChatRequest {
  message: string;
  documentId: number;
}

interface ChatResponse {
  answer: string;
  contextUsed?: string;
}

/* -------------------- COMPONENT -------------------- */

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { documentId } = useSelectedDocument();

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    if (!documentId) {
      alert("Lütfen önce bir belge seçin.");
      return;
    }

    const userText = input;

    // Kullanıcı mesajını ekle
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userText }
    ]);

    setInput("");
    setLoading(true);

    const payload: ChatRequest = {
      message: userText,
      documentId
    };

    const token = localStorage.getItem("token"); // 🔐 JWT

    try {
      const response = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      });

      // ❗ GÜVENLİ ERROR HANDLING
      if (!response.ok) {
        let errorMessage = "Backend hata verdi";

        try {
          const err = await response.json();
          errorMessage = err.message || errorMessage;
        } catch {
          // JSON değilse sessiz geç
        }

        throw new Error(errorMessage);
      }

      const data: ChatResponse = await response.json();

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.answer }
      ]);

    } catch (error: any) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: error.message || "Asistan şu anda yanıt veremiyor."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Bot className="text-blue-600" />
            Yapay Zeka Sohbet
          </CardTitle>

          {!documentId && (
            <p className="text-sm text-red-600 mt-1">
             Henüz bir belge seçmediniz. Belgeler sayfasından bir PDF seçin.
            </p>
          )}
        </CardHeader>

        <CardContent>
          {/* -------- MESSAGES -------- */}
          <div className="h-[420px] overflow-y-auto p-4 bg-slate-50 rounded-lg space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-slate-500">
                Bir soru yazarak sohbeti başlatabilirsiniz.
              </p>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "bot" && (
                  <Bot className="w-5 h-5 text-blue-600 mt-1" />
                )}

                <div
                  className={`px-4 py-2 rounded-lg max-w-[70%] text-sm ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border text-slate-800"
                  }`}
                >
                  {msg.text}
                </div>

                {msg.sender === "user" && (
                  <User className="w-5 h-5 text-slate-600 mt-1" />
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Bot className="w-5 h-5" /> Yazıyor...
              </div>
            )}
          </div>

          {/* -------- INPUT -------- */}
          <div className="flex gap-2 mt-4">
            <input
              className="flex-1 px-4 py-2 border rounded-lg outline-none"
              placeholder="Bir soru yazın..."
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
