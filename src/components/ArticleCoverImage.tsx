import { Article } from "@/lib/types";
import { getArticleCoverImage } from "@/lib/articleCover";

export default function ArticleCoverImage({
  article,
  alt,
  className,
}: {
  article: Pick<Article, "coverImageUrl">;
  alt: string;
  className: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={getArticleCoverImage(article)} alt={alt} className={className} />
  );
}
