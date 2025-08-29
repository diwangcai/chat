"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react'

export default function CallPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [audioOn, setAudioOn] = useState(true)
  const [videoOn, setVideoOn] = useState(true)

  useEffect(() => {
    const start = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        setStream(s)
        if (videoRef.current) {
          videoRef.current.srcObject = s
          await videoRef.current.play()
        }
      } catch (e) {
        console.error('无法打开摄像头/麦克风', e)
      }
    }
    start()
    return () => { stream?.getTracks().forEach(t => t.stop()) }
  }, [])

  const toggleAudio = () => {
    if (!stream) return
    stream.getAudioTracks().forEach(t => t.enabled = !t.enabled)
    setAudioOn(prev => !prev)
  }
  const toggleVideo = () => {
    if (!stream) return
    stream.getVideoTracks().forEach(t => t.enabled = !t.enabled)
    setVideoOn(prev => !prev)
  }
  const hangup = () => { stream?.getTracks().forEach(t => t.stop()); router.back() }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted></video>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button onClick={toggleAudio} className="icon-btn bg-white/90">
          {audioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        <button onClick={toggleVideo} className="icon-btn bg-white/90">
          {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>
        <button onClick={hangup} className="icon-btn" style={{ background: '#EF4444', color: 'white' }}>
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
