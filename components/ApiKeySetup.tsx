"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"

export default function ApiKeySetup() {
  const [apiKey, setApiKey] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    // Check if API key is configured via environment variable
    const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    const configured = envKey && envKey.trim() !== ""

    console.log("Environment API key status:", configured ? "Found" : "Not found")

    setIsConfigured(configured)
    setShowSetup(!configured)
  }, [])

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      // In a real app, you'd want to save this securely
      // For now, we'll just update the local state
      localStorage.setItem("gemini_api_key", apiKey)
      setIsConfigured(true)
      setShowSetup(false)

      // Show success message
      alert("API key saved! Please refresh the page for changes to take effect.")
    }
  }

  if (isConfigured && !showSetup) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowSetup(true)}
          variant="outline"
          size="sm"
          className="bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Gemini AI Connected
        </Button>
      </div>
    )
  }

  if (!showSetup) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-secondary border-themed">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Key className="w-6 h-6 text-purple-400 mr-2" />
            <h3 className="text-xl font-bold text-primary">Setup Gemini AI</h3>
          </div>

          <Alert className="mb-4 border-yellow-500/30 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-200">
              To get the best roasting experience, you need a Gemini AI API key.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Gemini API Key</label>
              <Input
                type="password"
                placeholder="Enter your Gemini API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-primary border-purple-500/30 text-primary"
              />
            </div>

            <div className="text-sm text-secondary">
              <p className="mb-2">Don't have an API key?</p>
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20 bg-transparent"
                onClick={() => window.open("https://makersuite.google.com/app/apikey", "_blank")}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Get Gemini API Key
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveKey}
                disabled={!apiKey.trim()}
                className="flex-1 bg-purple-500 hover:bg-purple-600"
              >
                Save & Continue
              </Button>
              <Button
                onClick={() => setShowSetup(false)}
                variant="outline"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
              >
                Skip
              </Button>
            </div>
          </div>

          <div className="mt-4 text-xs text-secondary">
            <p>Your API key is stored locally and never sent to our servers.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
