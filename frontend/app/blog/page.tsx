import Link from "next/link";
import Image from "next/image";

export default function BlogPage() {
  const articles = [
    {
      title: "Why Traditional Repairs Are Dying",
      excerpt: "The auto repair industry is changing. Learn why subscription-based models are the future of vehicle maintenance.",
      category: "Industry Trends",
      readTime: "5 min read",
    },
    {
      title: "How to Get the Most from Your Membership",
      excerpt: "Tips and tricks to maximize your Membership Auto benefits and keep your vehicle running smoothly.",
      category: "Member Resources",
      readTime: "4 min read",
    },
    {
      title: "5 Repairs You Should Never Delay",
      excerpt: "Some repairs can't wait. Learn which issues require immediate attention to avoid costly damage.",
      category: "Vehicle Care",
      readTime: "6 min read",
    },
    {
      title: "What Your Check Engine Light Really Means",
      excerpt: "Don't panic when that orange light appears. Here's what it actually means and what you should do.",
      category: "Vehicle Care",
      readTime: "3 min read",
    },
  ];

  const seoKeywords = [
    "vehicle repair subscription",
    "car maintenance membership",
    "best extended warranty alternative",
    "car repair plans monthly",
    "automotive repair savings",
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <section className="bg-[#111111] py-20 border-b border-[var(--border-color)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--gold)] mb-6">
            Blog & Resources
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Expert advice, industry insights, and tips to keep your vehicle running smoothly.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {articles.map((article, index) => (
              <Link
                key={index}
                href={`/blog/${article.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="bg-[var(--surface)] rounded-lg shadow-lg overflow-hidden border border-[var(--border-color)] hover:shadow-2xl hover:border-[var(--gold)] transition-all duration-200"
              >
                <div className="h-48 bg-[#1a1a1a] flex items-center justify-center border-b border-[var(--border-color)]">
                  <div className="text-6xl">📰</div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="px-3 py-1 bg-[rgba(203,168,110,0.12)] text-[var(--gold)] text-xs font-semibold rounded-full">
                      {article.category}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">
                      {article.readTime}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
                    {article.title}
                  </h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {article.excerpt}
                  </p>
                  <div className="mt-4 text-[var(--gold)] font-semibold">
                    Read more →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Keywords Section */}
      <section className="py-20 bg-[var(--background)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-[var(--gold)] mb-8 text-center">
              Popular Topics
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {seoKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-[var(--surface)] text-[var(--text-secondary)] rounded-full text-sm font-medium border border-[var(--border-color)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors cursor-pointer"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-[#111111] border-t border-[var(--border-color)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--gold)] mb-6">
            Stay Updated
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
            Get the latest tips, industry news, and exclusive member content delivered to your inbox.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full bg-[var(--surface)] border border-[var(--border-color)] text-[var(--foreground)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
            />
            <button className="px-8 py-4 bg-[var(--gold)] text-[#0d0d0d] font-semibold rounded-full hover:bg-[#d8b87f] transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

