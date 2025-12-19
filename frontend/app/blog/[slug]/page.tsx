import Link from "next/link";
import { notFound } from "next/navigation";

// Article data - in a real app, this would come from a CMS or database
const articles = [
  {
    slug: "why-traditional-repairs-are-dying",
    title: "Why Traditional Repairs Are Dying",
    category: "Industry Trends",
    readTime: "5 min read",
    date: "November 15, 2025",
    excerpt: "The auto repair industry is changing. Learn why subscription-based models are the future of vehicle maintenance.",
    content: `
      <p>The automotive repair industry has operated on the same model for decades: something breaks, you pay to fix it, and hope nothing else goes wrong. But this reactive approach is becoming obsolete.</p>
      
      <h2>The Problems with Traditional Repairs</h2>
      <p>Traditional auto repair comes with several major pain points:</p>
      <ul>
        <li><strong>Unpredictable costs:</strong> You never know when a major repair will hit your wallet</li>
        <li><strong>No preventive care:</strong> Most people skip maintenance until something breaks</li>
        <li><strong>Shop hopping:</strong> Finding a trustworthy mechanic is difficult</li>
        <li><strong>Price gouging:</strong> Emergency repairs often come with inflated prices</li>
      </ul>

      <h2>Why Subscriptions Make Sense</h2>
      <p>Subscription-based vehicle maintenance solves these problems by:</p>
      <ul>
        <li>Providing predictable monthly costs with no surprise bills</li>
        <li>Encouraging preventive maintenance to catch issues early</li>
        <li>Building long-term relationships with certified mechanics</li>
        <li>Offering comprehensive coverage at a fixed rate</li>
      </ul>

      <h2>The Future is Here</h2>
      <p>Just like streaming services replaced cable TV and subscription software replaced one-time purchases, membership-based auto repair is replacing the traditional pay-per-repair model. It's more convenient, more affordable, and gives you peace of mind.</p>

      <p>At Membership Auto, we're leading this change. One monthly fee covers all your vehicle's needs - no surprise bills, no unexpected costs, just reliable service when you need it.</p>
    `,
  },
  {
    slug: "how-to-get-the-most-from-your-membership",
    title: "How to Get the Most from Your Membership",
    category: "Member Resources",
    readTime: "4 min read",
    date: "November 10, 2025",
    excerpt: "Tips and tricks to maximize your Membership Auto benefits and keep your vehicle running smoothly.",
    content: `
      <p>You've made the smart choice to join Membership Auto. Now let's make sure you're getting the maximum value from your membership.</p>

      <h2>Use Your Benefits Regularly</h2>
      <p>Don't wait for problems to arise. Schedule regular maintenance visits to keep your vehicle in top shape:</p>
      <ul>
        <li>Oil changes every 3,000-5,000 miles</li>
        <li>Tire rotations every 5,000-7,500 miles</li>
        <li>Seasonal inspections before summer and winter</li>
        <li>Regular diagnostics to catch issues early</li>
      </ul>

      <h2>Book Appointments in Advance</h2>
      <p>Plan your service visits ahead of time to get the best time slots. Our members who schedule a month out get priority booking and can often get same-day service.</p>

      <h2>Use the Mobile App</h2>
      <p>Track your service history, schedule appointments, and get maintenance reminders all in one place. The app makes it easy to stay on top of your vehicle's needs.</p>

      <h2>Ask Questions</h2>
      <p>Our mechanics are here to help. Don't hesitate to ask about strange noises, warning lights, or performance issues. Early detection saves money and prevents bigger problems.</p>

      <h2>Refer Friends</h2>
      <p>Share the benefits with friends and family. Our referral program rewards you for spreading the word about Membership Auto.</p>
    `,
  },
  {
    slug: "5-repairs-you-should-never-delay",
    title: "5 Repairs You Should Never Delay",
    category: "Vehicle Care",
    readTime: "6 min read",
    date: "November 5, 2025",
    excerpt: "Some repairs can't wait. Learn which issues require immediate attention to avoid costly damage.",
    content: `
      <p>While having a membership means most repairs won't cost you extra, some issues need immediate attention to prevent dangerous situations or catastrophic damage.</p>

      <h2>1. Brake Problems</h2>
      <p>If you hear squealing, grinding, or feel vibrations when braking, get it checked immediately. Brake failure can lead to serious accidents.</p>
      <p><strong>Warning signs:</strong> Squealing noise, soft brake pedal, vibrations, pulling to one side</p>

      <h2>2. Engine Overheating</h2>
      <p>An overheating engine can warp cylinder heads, blow head gaskets, or even seize completely. If your temperature gauge is in the red, pull over safely and call for service.</p>
      <p><strong>Warning signs:</strong> Temperature gauge in red zone, steam from hood, sweet smell</p>

      <h2>3. Oil Leaks</h2>
      <p>Oil is your engine's lifeblood. A significant leak can lead to engine failure if not addressed quickly.</p>
      <p><strong>Warning signs:</strong> Puddles under car, burning oil smell, low oil warning light</p>

      <h2>4. Transmission Issues</h2>
      <p>Transmission repairs are expensive. Catching problems early can save thousands in repair costs.</p>
      <p><strong>Warning signs:</strong> Slipping gears, delayed shifting, grinding noises, burning smell</p>

      <h2>5. Suspension Damage</h2>
      <p>Damaged suspension affects handling and can make your vehicle unsafe to drive, especially at highway speeds.</p>
      <p><strong>Warning signs:</strong> Excessive bouncing, pulling, uneven tire wear, bottoming out</p>

      <h2>The Membership Advantage</h2>
      <p>With Membership Auto, you never have to delay repairs due to cost concerns. Your membership covers these critical repairs, so you can address problems immediately without worrying about the bill.</p>
    `,
  },
  {
    slug: "what-your-check-engine-light-really-means",
    title: "What Your Check Engine Light Really Means",
    category: "Vehicle Care",
    readTime: "3 min read",
    date: "November 1, 2025",
    excerpt: "Don't panic when that orange light appears. Here's what it actually means and what you should do.",
    content: `
      <p>The check engine light is one of the most misunderstood dashboard warnings. Let's demystify what it means and how to respond.</p>

      <h2>Why It Comes On</h2>
      <p>Your check engine light is connected to your vehicle's onboard diagnostic system (OBD-II). It monitors hundreds of sensors and systems. When something falls outside normal parameters, the light illuminates.</p>

      <h2>Common Causes</h2>
      <p>The check engine light can indicate many issues, from minor to serious:</p>
      <ul>
        <li><strong>Loose gas cap:</strong> The most common and easiest fix</li>
        <li><strong>Oxygen sensor:</strong> Affects fuel efficiency and emissions</li>
        <li><strong>Catalytic converter:</strong> Expensive repair if ignored</li>
        <li><strong>Mass airflow sensor:</strong> Impacts engine performance</li>
        <li><strong>Spark plugs/ignition coils:</strong> Causes misfires and poor performance</li>
      </ul>

      <h2>Should You Panic?</h2>
      <p><strong>Solid light:</strong> Something needs attention, but it's not an emergency. Schedule a diagnostic soon.</p>
      <p><strong>Flashing light:</strong> This indicates a serious problem, usually a misfire that could damage the catalytic converter. Get service immediately.</p>

      <h2>What to Do</h2>
      <ol>
        <li>Check if your gas cap is loose or missing</li>
        <li>Note if the light is solid or flashing</li>
        <li>Pay attention to any changes in performance</li>
        <li>Schedule a diagnostic scan</li>
        <li>Don't ignore it - problems get worse and more expensive over time</li>
      </ol>

      <h2>Free Diagnostics for Members</h2>
      <p>Membership Auto members get free diagnostic scans to identify the exact issue. We'll read the error codes, explain the problem, and fix it - all included in your membership.</p>
    `,
  },
];

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Article Header */}
      <section className="bg-[#111111] py-20 border-b border-[var(--border-color)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[var(--gold)] hover:text-[#d8b87f] transition-colors mb-6"
            >
              ← Back to Blog
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-[rgba(203,168,110,0.12)] text-[var(--gold)] text-sm font-semibold rounded-full">
                {article.category}
              </span>
              <span className="text-sm text-[var(--text-muted)]">
                {article.readTime}
              </span>
              <span className="text-sm text-[var(--text-muted)]">
                {article.date}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--gold)] mb-6">
              {article.title}
            </h1>
            <p className="text-xl text-[var(--text-secondary)]">
              {article.excerpt}
            </p>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <article
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* CTA */}
            <div className="mt-12 p-8 bg-[var(--surface)] border border-[var(--border-color)] rounded-lg">
              <h3 className="text-2xl font-bold text-[var(--gold)] mb-4">
                Ready to Experience Stress-Free Vehicle Care?
              </h3>
              <p className="text-[var(--text-secondary)] mb-6">
                Join thousands of members who never worry about unexpected repair bills again.
              </p>
              <Link
                href="/plans"
                className="inline-block bg-[var(--gold)] text-[#0d0d0d] px-8 py-3 rounded-full font-semibold hover:bg-[#d8b87f] transition-colors"
              >
                View Plans & Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-20 bg-[#111111] border-t border-[var(--border-color)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-[var(--gold)] mb-8 text-center">
              More Articles
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {articles
                .filter((a) => a.slug !== slug)
                .slice(0, 3)
                .map((relatedArticle) => (
                  <Link
                    key={relatedArticle.slug}
                    href={`/blog/${relatedArticle.slug}`}
                    className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--border-color)] hover:border-[var(--gold)] transition-all"
                  >
                    <span className="px-3 py-1 bg-[rgba(203,168,110,0.12)] text-[var(--gold)] text-xs font-semibold rounded-full">
                      {relatedArticle.category}
                    </span>
                    <h3 className="text-xl font-bold text-[var(--foreground)] mt-4 mb-2">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {relatedArticle.excerpt}
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
