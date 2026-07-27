'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

interface Props {
  isOpen: boolean
  mode: 'login' | 'logout'
}

const animationStyles = `
  .door-panel { transform-box: fill-box; transform-origin: left center; }
  .door-panel-login  { animation: doorOpen  0.55s ease-in-out 0.05s both; }
  .door-panel-logout { transform: scaleX(0.06); animation: doorClose 0.5s ease-in-out 0.75s forwards; }

  .door-light-login  { opacity: 0; animation: lightFadeIn  0.4s ease-out 0.15s forwards; }
  .door-light-logout { opacity: 1; animation: lightFadeOut 0.3s ease-in  0.85s forwards; }

  .character-login  { opacity: 0; animation: walkIn  1.4s ease-in-out 0.2s forwards; }
  .character-logout {             animation: walkOut 0.9s ease-in-out 0s   forwards; }

  .leg-l, .leg-r { transform-box: fill-box; transform-origin: top center; }
  .leg-l { animation: legSwingL 0.28s linear infinite; }
  .leg-r { animation: legSwingR 0.28s linear infinite; }

  @keyframes doorOpen   { 0% { transform: scaleX(1);    } 100% { transform: scaleX(0.06); } }
  @keyframes doorClose  { 0% { transform: scaleX(0.06); } 100% { transform: scaleX(1);    } }

  @keyframes lightFadeIn  { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes lightFadeOut { 0% { opacity: 1; } 100% { opacity: 0; } }

  @keyframes walkIn {
    0%   { transform: translateX(110px); opacity: 0; }
    15%  { opacity: 1; }
    85%  { opacity: 1; }
    100% { transform: translateX(55px);  opacity: 0; }
  }
  @keyframes walkOut {
    0%   { transform: translateX(0px);  opacity: 1; }
    85%  { opacity: 1; }
    100% { transform: translateX(55px); opacity: 0; }
  }
  @keyframes legSwingL { 0%,100%{ transform: rotate(24deg);  } 50%{ transform: rotate(-24deg); } }
  @keyframes legSwingR { 0%,100%{ transform: rotate(-24deg); } 50%{ transform: rotate(24deg);  } }
`

export default function DoorAnimationModal({ isOpen, mode }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isOpen) return null

  const isLogin = mode === 'login'

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
      <style>{animationStyles}</style>
      <div className="bg-card border-2 border-border rounded-base px-10 py-8 flex flex-col items-center gap-4 shadow-shadow">
        <svg width="180" height="178" viewBox="0 0 180 178" overflow="visible">
          {/* Floor */}
          <line x1="10" y1="165" x2="170" y2="165" stroke="#c8b89a" strokeWidth="2" />

          {/* Light behind door (visible when open) */}
          <rect
            x="60" y="28" width="56" height="135" fill="#fdf6e3"
            className={isLogin ? 'door-light-login' : 'door-light-logout'}
          />

          {/* Door frame */}
          <rect x="58" y="26" width="60" height="139" fill="none" stroke="#5e8ca7" strokeWidth="4" rx="2" />

          {/* Door panel */}
          <g className={`door-panel ${isLogin ? 'door-panel-login' : 'door-panel-logout'}`}>
            <rect x="60" y="28" width="56" height="135" fill="#e78e23" rx="1" />
            {/* Upper panel detail */}
            <rect x="66" y="36" width="38" height="46" fill="none" stroke="#c8690a" strokeWidth="1.5" rx="1" />
            {/* Lower panel detail */}
            <rect x="66" y="92" width="38" height="56" fill="none" stroke="#c8690a" strokeWidth="1.5" rx="1" />
            {/* Door knob */}
            <circle cx="108" cy="97" r="4.5" fill="#c8b89a" stroke="#a09070" strokeWidth="1" />
          </g>

          {/* Character */}
          <g className={isLogin ? 'character-login' : 'character-logout'}>
            {/* Head */}
            <circle cx="30" cy="114" r="14" fill="#5e8ca7" />
            {/* Eyes */}
            <circle cx="25" cy="111" r="2.5" fill="white" />
            <circle cx="35" cy="111" r="2.5" fill="white" />
            {/* Pupils */}
            <circle cx={isLogin ? '26' : '34'} cy="111" r="1.2" fill="#2d5a70" />
            <circle cx={isLogin ? '36' : '44'} cy="111" r="1.2" fill="#2d5a70" />
            {/* Smile */}
            <path d="M 25 119 Q 30 124 35 119" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Body */}
            <rect x="18" y="128" width="24" height="24" fill="#e78e23" rx="6" />
            {/* Left leg */}
            <g className="leg-l">
              <rect x="20" y="151" width="8" height="18" fill="#5e8ca7" rx="4" />
            </g>
            {/* Right leg */}
            <g className="leg-r">
              <rect x="30" y="151" width="8" height="18" fill="#5e8ca7" rx="4" />
            </g>
          </g>
        </svg>

        <p className="text-sm font-semibold text-foreground">
          {isLogin ? '입장 중...' : '퇴장 중...'}
        </p>
      </div>
    </div>,
    document.body
  )
}
