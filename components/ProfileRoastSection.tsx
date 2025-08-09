"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InvokeLLM } from "@/integrations/Core"
import { Github, Linkedin, Instagram, Loader2, Target, Save } from "lucide-react"
import Typewriter from "./common/Typewriter"
import { RoastSessionAPI } from "@/lib/roast-session-api"

export default function ProfileRoastSection() {
  const [profiles, setProfiles] = useState({
    github: "",
    linkedin: "",
    instagram: "",
  })
  const [roasts, setRoasts] = useState({})
  const [isLoading, setIsLoading] = useState({})
  const [isSaving, setIsSaving] = useState({})
  const [savedSessions, setSavedSessions] = useState({})

  const handleProfileChange = (platform, value) => {
    setProfiles((prev) => ({ ...prev, [platform]: value }))
  }

  const roastProfile = async (platform) => {
    const profileUrl = profiles[platform]
    if (!profileUrl) return

    setIsLoading((prev) => ({ ...prev, [platform]: true }))

    try {
      let prompt = ""
      const basePrompt =
        "Deliver a new, unique, and savage roast. Do not repeat previous roasts. Be witty, brutal, and creative. 2-3 sentences max."
      switch (platform) {
        case "github":
          prompt = `You are roasting a GitHub profile. Based on this URL: ${profileUrl}, roast their coding skills, commit messages, repository names, or lack thereof. Focus on typical GitHub fails like empty repos, terrible commit messages, or copying tutorials. ${basePrompt}`
          break
        case "linkedin":
          prompt = `You are roasting a LinkedIn profile. Based on this URL: ${profileUrl}, roast their buzzword-heavy job titles, corporate jargon, cringe posts, or fake professional persona. Be savage about their career choices. ${basePrompt}`
          break
        case "instagram":
          prompt = `You are roasting an Instagram profile. Based on this URL: ${profileUrl}, roast their cliche poses, basic captions, questionable filter choices, or try-hard aesthetic. Be brutal about their social media presence. ${basePrompt}`
          break
      }

      const response = await InvokeLLM({
        prompt,
        add_context_from_internet: true,
      })

      setRoasts((prev) => ({ ...prev, [platform]: response }))

      // Auto-save the profile roast session
      try {
        const session = await RoastSessionAPI.createRoastSession({
          section_type: "profile_roast",
          input_data: {
            platform: platform,
            profile_url: profileUrl,
          },
          roast_result: response,
        })
        setSavedSessions((prev) => ({ ...prev, [platform]: session.id }))
      } catch (saveError) {
        console.error("Failed to save profile roast session:", saveError)
      }
    } catch (error) {
      const errorRoast = `Your ${platform} is so bad, even our AI refuses to look at it. That's saying something.`
      setRoasts((prev) => ({
        ...prev,
        [platform]: errorRoast,
      }))

      // Save error roast too
      try {
        await RoastSessionAPI.createRoastSession({
          section_type: "profile_roast",
          input_data: { platform, profile_url: profileUrl, error: true },
          roast_result: errorRoast,
        })
      } catch (saveError) {
        console.error("Failed to save error profile roast session:", saveError)
      }
    }

    setIsLoading((prev) => ({ ...prev, [platform]: false }))
  }

  const saveProfileRoast = async (platform) => {
    const roast = roasts[platform]
    if (!roast) return

    setIsSaving((prev) => ({ ...prev, [platform]: true }))
    try {
      const session = await RoastSessionAPI.createRoastSession({
        section_type: "profile_roast",
        input_data: {
          platform: platform,
          profile_url: profiles[platform],
          manual_save: true,
        },
        roast_result: roast,
      })
      setSavedSessions((prev) => ({ ...prev, [platform]: session.id }))
    } catch (error) {
      console.error("Failed to save profile roast session:", error)
    }
    setIsSaving((prev) => ({ ...prev, [platform]: false }))
  }

  const platforms = [
    { id: "github", name: "GitHub", icon: Github, color: "text-gray-400", placeholder: "https://github.com/username" },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: Linkedin,
      color: "text-blue-400",
      placeholder: "https://linkedin.com/in/username",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      color: "text-pink-400",
      placeholder: "https://instagram.com/username",
    },
  ]

  return (
    <section id="profile-roast" className="min-h-screen flex items-center py-20 section-scroll">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-primary">
            <span className="gradient-text">The Digital</span>
            <br />
            Dossier Roast
          </h2>
          <p className="text-xl text-secondary mb-12">Your online presence is about to get professionally demolished</p>

          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <Card key={platform.id} className="bg-secondary border-themed">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <platform.icon className={`w-8 h-8 ${platform.color} mr-2`} />
                    <h3 className="text-xl font-bold text-primary">{platform.name}</h3>
                  </div>

                  <div className="space-y-4">
                    <Input
                      placeholder={platform.placeholder}
                      value={profiles[platform.id]}
                      onChange={(e) => handleProfileChange(platform.id, e.target.value)}
                      className="bg-primary border-purple-500/30 text-primary"
                    />

                    <Button
                      onClick={() => roastProfile(platform.id)}
                      disabled={isLoading[platform.id] || !profiles[platform.id]}
                      className="w-full bg-purple-500 hover:bg-purple-600"
                    >
                      {isLoading[platform.id] ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Scanning for flaws...
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-2" />
                          Roast My {platform.name}
                        </>
                      )}
                    </Button>

                    {roasts[platform.id] && (
                      <div className="mt-4 p-4 bg-primary rounded-lg border-themed min-h-[100px]">
                        <Typewriter text={roasts[platform.id]} className="text-sm text-primary leading-relaxed mb-4" />

                        <div className="flex justify-center">
                          {!savedSessions[platform.id] && (
                            <Button
                              onClick={() => saveProfileRoast(platform.id)}
                              disabled={isSaving[platform.id]}
                              variant="outline"
                              size="sm"
                              className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
                            >
                              {isSaving[platform.id] ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="w-3 h-3 mr-1" />
                                  Save
                                </>
                              )}
                            </Button>
                          )}
                          {savedSessions[platform.id] && (
                            <div className="text-xs text-green-400 flex items-center">✓ Saved</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
