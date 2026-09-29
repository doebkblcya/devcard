import { ArrowRight, Github, LoaderCircle } from "lucide-react";
import type { FormEvent } from "react";

interface Props {
  username: string;
  onUsernameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
}

export default function UserForm({ username, onUsernameChange, onSubmit, loading }: Props) {
  return (
    <form className="user-form" onSubmit={onSubmit}>
      <label htmlFor="username">GITHUB USERNAME</label>
      <div className="input-row">
        <div className="input-wrap">
          <Github size={19} strokeWidth={1.8} aria-hidden="true" />
          <span className="input-prefix">github.com/</span>
          <input
            id="username"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            placeholder="your-username"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={39}
            aria-label="GitHub username"
          />
        </div>
        <button className="generate-button" type="submit" disabled={loading}>
          {loading ? <LoaderCircle className="spin" size={19} /> : <ArrowRight size={19} />}
          <span>{loading ? "Generating" : "Generate card"}</span>
        </button>
      </div>
    </form>
  );
}
