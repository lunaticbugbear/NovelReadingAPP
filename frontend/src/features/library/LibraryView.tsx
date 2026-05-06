import { useEffect, useState } from 'react';
import type { NovelEntry } from '../../domain/models';
import { createLibraryRepository } from '../../storage/libraryRepository';

type Props = {
  listNovels?: () => Promise<NovelEntry[]>;
};

export function LibraryView({ listNovels = createLibraryRepository().listNovels }: Props) {
  const [novels, setNovels] = useState<NovelEntry[]>([]);

  useEffect(() => {
    void listNovels().then(setNovels);
  }, [listNovels]);

  return (
    <section className="view-stack">
      <h2>Library</h2>
      <div className="chips"><button>Reading</button><button>Plan to Read</button><button>Completed</button></div>
      {novels.length === 0 ? (
        <article className="result-card"><h3>Continue reading</h3><p>Your imported novels will appear here.</p></article>
      ) : novels.map((novel) => (
        <article className="result-card" key={novel.id}>
          <h3>{novel.title}</h3>
          <p>{novel.status}</p>
          <p>{novel.aliases.join(', ') || 'No aliases saved.'}</p>
          <p>{novel.chapters.length} chapters</p>
        </article>
      ))}
    </section>
  );
}
