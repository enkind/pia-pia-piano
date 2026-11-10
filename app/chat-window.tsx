"use client";

import { useState } from "react";
import { DEMO_SONGS } from "../lib/demo-songs";
import { Mark } from "./mark";
import { PianoCard } from "./piano-card";

const REPLIES: Record<string, string> = {
  twinkle: "Here it is. Press the lit key, and the next one lights up when you do.",
  ode: "Beethoven’s melody, on the white keys only. Take it at your own pace.",
  mary: "Of course. It only uses four keys, so it’s a good first song.",
};

export function ChatWindow() {
  const [openId, setOpenId] = useState(DEMO_SONGS[0].id);
  const open = DEMO_SONGS.find((song) => song.id === openId) ?? DEMO_SONGS[0];

  return (
    <div className="window">
      <div className="rail">
        <span className="label">Chats</span>
        {DEMO_SONGS.map((song) => (
          <button
            key={song.id}
            type="button"
            className="past"
            aria-pressed={song.id === openId}
            onClick={() => setOpenId(song.id)}
          >
            {song.title}
          </button>
        ))}
      </div>

      <div className="pane">
        <ol className="thread">
          <li>
            <p className="said">{open.ask}</p>
          </li>
          <li>
            <p>{REPLIES[open.id]}</p>
            <p className="app">
              <Mark />
              Pia Pia Piano
            </p>
            {/* Every conversation keeps its own frame, so switching back
                finds the song where you left it. */}
            <div className="cards">
              {DEMO_SONGS.map((song) => (
                <PianoCard key={song.id} song={song} inactive={song.id !== openId} />
              ))}
            </div>
          </li>
        </ol>

        <div className="composer" aria-hidden="true">
          <span>Ask anything</span>
          <span className="send">
            <svg viewBox="0 0 20 20">
              <path d="M10 15.5V5M5.5 9.5L10 5l4.5 4.5" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
