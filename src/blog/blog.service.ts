import fs from "fs";
import path from "path";
// @ts-ignore
import renderToString from "next-mdx-remote/render-to-string";
import matter from "gray-matter";
import { Site } from "site";
import mdxOptions from "src/mdx-options";

const root = process.cwd();

export class BlogService {
  async getPostsSlugs() {
    return fs
      .readdirSync(path.join(root, "posts"))
      .map((p) => ({ params: { slug: p.replace(/\.mdx/, "") } }));
  }

  async getPostBySlog(slug: string) {
    const source = fs.readFileSync(
      path.join(root, "posts", `${slug}.mdx`),
      "utf8"
    );

    const posts = await this.getPosts();
    posts.sort((a, b) => Number(new Date(a.date)) - Number(new Date(b.date)));
    const thisPosts = posts.findIndex((post) => post.slug === slug);
    const next = posts[thisPosts + 1] ?? null;
    const previous = posts[thisPosts - 1] ?? null;

    const { data, content } = matter(source);
    const mdxSource = await renderToString(content, mdxOptions);

    return {
      mdxSource,
      frontMatter: data,
      next,
      previous,
    };
  }

  async getPosts() {
    const contentRoot = path.join(root, "posts");
    const postData = fs.readdirSync(contentRoot).map((p) => {
      const content = fs.readFileSync(path.join(contentRoot, p), "utf8");
      const frontMatter = matter(content).data;

      return {
        slug: p.replace(/\.mdx/, ""),
        content,
        title: frontMatter.title as string,
        image: (frontMatter.image as string) ?? Site.mainIcon,
        tags: (frontMatter.tags as string[]) ?? ["عام"],
        date: frontMatter.date as string,
        frontMatter,
      };
    });
    postData.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return postData;
  }
}
