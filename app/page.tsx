import Link from "next/link";
import { ChatWindow } from "./chat-window";
import { CopyButton } from "./copy-button";
import { Mark } from "./mark";
import "./styles.css";

const INSTALL_PROMPT =
  "Install the Pia Pia Piano plugin from the production branch of https://github.com/enkind/pia-pia-piano";

/** One octave of a keyboard, repeated edge to edge under the navigation. */
function Keybed() {
  return (
    <svg className="keybed" aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <pattern id="octave" width="98" height="28" patternUnits="userSpaceOnUse">
          {[14, 28, 42, 56, 70, 84, 98].map((x) => (
            <path key={x} d={`M${x - 0.5} 0V28`} />
          ))}
          {[10, 24, 52, 66, 80].map((x) => (
            <rect key={x} x={x} width="8" height="17" rx="1.5" />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="28" fill="url(#octave)" />
    </svg>
  );
}

export default function Home() {
  return (
    <main>
      <nav className="nav">
        <div className="inner">
          <Link className="wordmark" href="/">
            <Mark />
            Pia Pia Piano
          </Link>
          <span className="spacer" />
          <a href="https://github.com/enkind/pia-pia-piano">GitHub</a>
          <a className="button" href="#install">
            Add to your agent
          </a>
        </div>
      </nav>
      <Keybed />

      <section className="hero">
        <div className="inner">
          <h1>Your agent knows the song. Now you can play it.</h1>
          <p className="lede">
            Pia Pia Piano is a free plugin for the agent you already use. Ask how a
            song goes, and a piano opens in the chat with the notes lined up. The
            next key lights up and waits for you.
          </p>

          <ChatWindow />

          <p className="caption">
            The chat is a mock. The piano inside it is the same one your agent
            opens, so turn your sound on and play.
          </p>
        </div>
      </section>

      <section className="band">
        <div className="inner">
          <h2>From a question to the song under your fingers.</h2>

          <ol className="steps">
            <li>
              <h3>Ask for a song</h3>
              <p>
                “How does Ode to Joy go?” or “Teach me Twinkle Twinkle.” Any
                melody your agent knows or can look up.
              </p>
            </li>
            <li>
              <h3>Your agent writes it out</h3>
              <p>
                It sends the melody note by note, with the words when the song
                has them. You get a piano with just the keys the song needs.
              </p>
            </li>
            <li>
              <h3>Play it at your pace</h3>
              <p>
                Press the lit key and the next one lights up. A wrong key flashes
                red and the song waits. Start over whenever you like.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section className="band" id="install">
        <div className="inner">
          <h2>Add it to your agent.</h2>
          <p className="lede">No account, no key, nothing to download.</p>

          <div className="ways">
            <article>
              <h3>Ask your agent to install it</h3>
              <p>Paste this into Codex, Cursor, or Claude Code, then start a new chat.</p>
              <p className="address">
                <code>{INSTALL_PROMPT}</code>
                <CopyButton value={INSTALL_PROMPT} />
              </p>
            </article>

            <article>
              <h3>From your agent’s plugin directory</h3>
              <p>
                One-click install from the plugin directory in ChatGPT and Codex
                is on its way.
              </p>
            </article>
          </div>
        </div>
      </section>

      <footer>
        <div className="inner">
          <p className="site-links">
            <a href="https://github.com/enkind/pia-pia-piano">GitHub</a>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/support">Support</Link>
          </p>
          <p className="colophon">Free and noncommercial. MIT licensed. Made by dzhunka.</p>
        </div>
      </footer>
    </main>
  );
}
