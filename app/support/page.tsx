import Link from "next/link";
import type { Metadata } from "next";

import "../styles.css";

export const metadata: Metadata = {
  title: "Support · Pia Pia Piano",
  description: "How to report a problem with Pia Pia Piano or ask a question.",
};

export default function Support() {
  return (
    <main className="legal">
      <section>
        <h1>Support</h1>
        <p className="updated">Last updated 10 November 2026</p>

        <p>Problems, questions, and suggestions all go to the public issue tracker:</p>
        <p>
          <a href="https://github.com/enkind/pia-pia-piano/issues">
            github.com/enkind/pia-pia-piano/issues
          </a>
        </p>
        <p>
          Pia Pia Piano is a free, noncommercial project maintained by one person,
          so support is best-effort rather than a guaranteed response time.
          Issues are handled in the open so other people can find the answer.
        </p>

        <h2>Reporting a problem</h2>
        <p>
          The most useful report says which agent host you were using, which song
          you asked for, and what happened instead: whether the piano appeared,
          whether it made a sound when you pressed a key, and whether the lit key
          moved on. A screenshot of the piano in the conversation usually settles
          it faster than a description.
        </p>
        <p>
          No sound at all is most often the device: check that it is not muted
          and that the volume is up, then press a key again. The piano can only
          start making sound after you press something.
        </p>

        <h2>Privacy when reporting</h2>
        <p>
          An issue you open is public. Redact anything from your conversation that
          you would not want published before pasting it in.
        </p>

        <p className="back">
          <Link href="/">Back to Pia Pia Piano</Link>
        </p>
      </section>
    </main>
  );
}
