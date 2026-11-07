import { Link } from 'react-router';
import { Gallery } from '../components/Gallery.tsx';
import type { GalleryCard } from '../components/Gallery.tsx';
import { Title } from '../components/Title.tsx';
import { photoSrc, photoSrcSet, photos } from '../photos.ts';
import type { Photo } from '../photos.ts';

/**
 * The book's landing page, carried over from the original germanwarletters.com
 * with its text unchanged. The letters themselves live under the Letters tab.
 */
export function HomePage() {
  return (
    <article className="home">
      <Title text="" />
      <header className="hero">
        <div className="hero__text">
          <h1 className="hero__title">
            Memories of a Lost Generation: <span className="hero__subtitle">German War Letters, 1939–1945</span>
          </h1>
          <p className="hero__tagline">
            The book tells the story of a generation of German men, women and children who were forced by an evil government to go to war
            and once in that war, they had to fight to the end to try to save their families from the vengeance of both Adolf Hitler and
            Joseph Stalin.
          </p>
        </div>
        <Figure photo={photos.hero} className="hero__figure" sizes="(min-width: 64rem) 34rem, 92vw" priority />
      </header>

      <section className="home__section home__intro" aria-labelledby="speak">
        <h2 id="speak">The soldiers speak for themselves</h2>
        <p>
          This book is based on actual WW2 letters from German soldiers which paint a deep and vivid portrait of the life of Germans during
          the war.
        </p>
      </section>

      <section className="home__section dedication" aria-labelledby="dedication">
        <h2 id="dedication">Excerpt from the Dedication</h2>
        <p>
          Please note that this book is written from the German point of view. This approach is dictated by the nature of the material I am
          dealing with: personal letters from German soldiers. It is not intended in any way to defend or justify National Socialism. It is
          designed to give voice to those who can no longer speak for themselves. The history of the war in Europe is extremely complex. Axis
          and Allied propagandists created simplified black-and-white versions of history to suit their own agendas, but, in reality, history
          is multifaceted.
        </p>
        <p>
          This book tells the story of a generation of German men, women, and children, many of whom were conscripted and forced to go to war
          and who, once in that war, had to fight to the end to try to save their families from the wrath of both Joseph Stalin and Adolf
          Hitler. When the war was over, the lucky few managed to come home; the others spent years, and, in some cases, decades in Soviet
          forced labor camps. Most of these men and boys died without ever seeing Germany again. The wartime stories of several German veterans
          (who are all U.S. citizens now) were the primary motivation behind the writing of this book.
        </p>
        <p>
          One individual, however, was not only inspirational but also necessary for the success of the project, for he translated many of the
          letters in this volume. His name is Wilhelm Gehlen (see his photo to the left). Wilhelm was born in 1933 in Viersen, Germany. He was
          12 years old when the war ended. At the time, he and his boyhood friends were &ldquo;serving&rdquo; in the Luftwaffe, manning a 20 mm
          quad anti-aircraft gun in his hometown. Despite what one might think, these boys were not just playing army; U.S. planes attacking
          them were firing real rounds, as were the boys defending the town. In the month and a half that Wilhelm served in the German
          military, the boys managed to shoot down six U.S. and one British aircraft. Fortunately, Viersen was captured by the Americans. The
          story would have had a very different ending if the city had fallen to the Red Army. Wilhelm was released after a very brief
          captivity that amounted to a photo opportunity for U.S. GIs. This book is dedicated to Wilhelm and the rest of his forgotten comrades
          who manned the guns at Viersen.
        </p>
      </section>

      <section className="home__section" aria-labelledby="maps">
        <h2 id="maps">Maps and Photos</h2>
        <Gallery cards={mapsAndPhotos} label="Maps and photos" />
      </section>

      <section className="home__section documents" aria-labelledby="documents">
        <h2 id="documents">Documents and Letters</h2>
        <Gallery cards={documents} label="Documents and letters" columns={2} />
      </section>

      <section className="home__section why" aria-labelledby="why">
        <h2 id="why">Why use Letters to Tell the Story of the War?</h2>
        <Figure photo={photos.why} className="why__figure" sizes="(min-width: 64rem) 26rem, 92vw" />
        <p>
          Certainly much has been published on the subject of the Third Reich, almost always based on the analysis of official histories,
          documents, interviews and recently, secret recordings of German prisoners of war made during the conflict. Documents and official
          histories by their very nature are likely to be used as vehicles of official propaganda, and post-war interviews don&rsquo;t
          necessarily reflect the true feelings of the people being interviewed. In addition, secretly taped conversations are suspect as well,
          especially those that were facilitated with the use of an Allied agent to direct the conversation. This is the case because soldiers
          in that situation would frequently brag and exaggerate about both good things and bad.
        </p>
        <p>
          Whereas all of this information is certainly valuable and to a greater or lesser degree accurate, I believe that letters, personal
          letters, although not perfect, are a more accurate source of information about the war. They capture a moment in time. They are far
          more likely to present an accurate account of what life during the Second World War was like for the typical German family, what
          they thought at the time and how they coped. For many years, because of the nature of the war and its aftermath, the topic has been
          taboo and to a degree still is. It is, however, impossible to understand the war and its importance if you continue to dismiss the
          perspective of half of the participants. Research into German war letters is necessary to fully appreciate the nature of the common
          soldier&rsquo;s participation in the conflict.
        </p>
        <p>
          Unfortunately, there are now only an estimated 120,000 to 150,000 surviving letters out of the approximately 30 to 40 billion that
          were mailed during the War. One of the most important aspects of this book is the fact that all of the letters and most of the
          documents are previously unpublished primary sources. The total number of letters included in this study collection stands at 544
          which will permanently preserve a little under .5% of the estimated total. Facsimile images of all original letters and documents
          presented in the text are available to the reader. The large number of pages (just over 2000) in the corpus mitigates against the use
          of a traditional appendix. All correspondence and documents are numbered consecutively to match their appearance in the text. To
          maintain a statistically valid, unbiased sample, the contents of the letters were translated after they were selected for use in the
          study. The selection of the letters for inclusion was based solely on the unit identification of the individuals who wrote the
          letters, all of which were written between 1937 and 1945. It is imperative that all primary sources be randomly selected. Otherwise,
          the result of the research will be predetermined by the selected letters and subject to manipulation. In an ideal world, it would
          also be helpful to have the same number of letters from each individual represented in the corpus. This approach is problematic;
          because of the relatively small number of surviving German World War II letters it could only be achieved by randomly selecting far
          fewer letters and in so doing eliminate relevant and important references to wartime events.
        </p>
        <p className="home__callout">
          <Link to="/letters">Letter Scans</Link>
        </p>
        <p>
          The letters come from just about every branch of the German military, the Nazi political establishment, and the civilian
          population. Included in the corpus are letters to and from soldiers in the Wehrmacht, the Luftwaffe, the Kriegsmarine, the Waffen SS,
          the SD, the RAD, Pioneer Units, a punishment battalion and three letters from concentration camps. Unlike the letters, which were
          randomly selected, the documents were chosen on the basis of content. In some cases, they relate directly to situations mentioned in
          the letters. This book is intended to be more than just another military history of Germany during the Second World War. Of course,
          the inclusion of information about the war in general, Nazi culture, and the German/ Soviet War in particular, is necessary to put
          the letters in their proper historical context. Throughout the book, the wartime stories of the families and individuals involved
          will be intertwined with the history of the conflict. The result provides the reader with a unique perspective on the struggle from
          the point of view of typical German soldiers and German families during the war, not 75 years after the fact. The letters contain a
          considerable amount of commentary on battles fought, which can supplement existing histories, and they also provide a treasure trove
          of information about life on the front lines in Russia.
        </p>
      </section>
    </article>
  );
}

function Figure({ photo, className, sizes, priority = false }: { photo: Photo; className: string; sizes: string; priority?: boolean }) {
  return (
    <figure className={className}>
      <img
        src={photoSrc(photo, 800)}
        srcSet={photoSrcSet(photo)}
        sizes={sizes}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
      />
    </figure>
  );
}

const mapsAndPhotos: GalleryCard[] = [
  {
    photos: [photos.heinrichMailRun, photos.eastern],
    caption: (
      <p>
        Photograph #10. was sent home to Heinrich&rsquo;s family in the winter of 1942. It depicts Heinrich on a mail and supply run in the
        southern Ukraine.
      </p>
    ),
  },
  {
    photos: [photos.heinrichHowitzer, photos.caucasus],
    caption: (
      <p>
        Photograph #11 was sent home from the Ukraine by Heinrich in the early spring of 1942. He is second from the left standing below the X
        and immediately behind his 105 mm field howitzer.
      </p>
    ),
  },
  {
    photos: [photos.bunkers, photos.shockArmy],
    caption: <p>Photograph #24. Downtime for the Regiment outside of their forest bunkers. Summer 1943.</p>,
  },
  {
    photos: [photos.mailCall, photos.orel],
    caption: <p>Photograph #23. Mail call for the 112th Panzer Grenadiers. Summer 1943.</p>,
  },
];

const documents: GalleryCard[] = [
  { photos: [photos.sampleLetter], caption: <p>A sample letter</p> },
  {
    photos: [photos.hellmut],
    caption: (
      <p>
        Image #5. Here we have Hellmut&rsquo;s artwork, from a letter to his father, depicting a German military base, probably along the
        Siegfried line. The letter was sent on the last day of May 1940, right before the final collapse of French resistance. Letter #6.
      </p>
    ),
  },
  {
    photos: [photos.radioNotice],
    caption: (
      <p>
        The notice was sent to Mr. Theofil informing him that he was currently in violation of regulations concerning radio receiver
        ownership. Click the image for a larger picture.
      </p>
    ),
  },
  {
    photos: [photos.gestapo],
    caption: (
      <p>
        This is a Gestapo arrest warrant dated March 3, 1942. The document bears the rubberstamp of the &ldquo;Secret State Police&rdquo;
        (Gestapo). Click the image for a larger picture.
      </p>
    ),
  },
];
