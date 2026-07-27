import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Blog from "../models/Blog.js";

export async function autoSeedDatabase() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "domakondajashwanth12k@gmail.com";
    const adminPass = process.env.ADMIN_PASSWORD || "Jashwanth@12";

    // 1. Ensure Admin User exists and is active
    let admin = await User.findOne({ email: adminEmail.toLowerCase() });
    const hashedPassword = await bcrypt.hash(adminPass, 10);

    if (!admin) {
      admin = await User.create({
        name: "Super Admin",
        username: "superadmin",
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        isAdmin: true,
        role: "SUPER_ADMIN",
        adminRole: "Super Admin",
        verified: true,
        status: "active",
        bio: "Lead System Administrator & Tech Creator",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
      });
      console.log("✨ Seeded default Admin user:", adminEmail);
    } else if (!admin.isAdmin) {
      admin.isAdmin = true;
      admin.role = "SUPER_ADMIN";
      admin.adminRole = "Super Admin";
      admin.verified = true;
      admin.status = "active";
      await admin.save();
      console.log("✨ Promoted user to Admin:", adminEmail);
    }

    // 2. Ensure Author User exists with the right username
    let author = await User.findOne({ email: "author@blogify.com" });
    if (!author) {
      const authorHash = await bcrypt.hash("Author123!", 10);
      author = await User.create({
        name: "Alex Rivera",
        username: "author",
        email: "author@blogify.com",
        password: authorHash,
        isAdmin: false,
        role: "USER",
        verified: true,
        status: "active",
        bio: "Senior Full Stack Architect & Tech Blogger",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
      });
      console.log("✨ Seeded default Author user: author@blogify.com");
    } else {
      // Fix username if it's wrong or missing
      let changed = false;
      if (author.username !== "author") { author.username = "author"; changed = true; }
      if (author.isAdmin) { author.isAdmin = false; changed = true; }
      if (!author.verified) { author.verified = true; changed = true; }
      if (author.status !== "active") { author.status = "active"; changed = true; }
      if (changed) {
        await author.save();
        console.log("✨ Fixed Author user: username set to 'author'");
      }
    }

    // 3. Seed Sample Blogs if database has 0 blogs
    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      const sampleBlogs = [
        {
          title: "The Future of Web Development in 2026: AI, React 19 & Beyond",
          subTitle: "Exploring cutting-edge frontend architectures, full-stack performance optimization, and AI copilot integrations.",
          category: "Technology",
          tags: ["react", "webdev", "ai", "javascript"],
          description: "<h2>The Next Frontier of Web Development</h2><p>Modern web development is evolving faster than ever. With React 19 server components, AI integrations, and edge deployment platforms, developers have unprecedented superpowers.</p><h3>Key Trends Driving 2026</h3><ul><li><strong>AI-Driven UI Generation:</strong> Real-time contextual component synthesis.</li><li><strong>Edge Compute & Instant Rendering:</strong> Sub-50ms global response times.</li><li><strong>Seamless Mobile Bridges:</strong> Capacitor 6 and cross-platform native SDKs.</li></ul>",
          image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
          author: author._id,
          isPublished: true,
          isFeatured: true,
          views: 1420,
          likes: 42
        },
        {
          title: "Designing Mindful Digital Experiences: A UI/UX Masterclass",
          subTitle: "How harmonious color systems, typography scale, and micro-interactions elevate product aesthetic and engagement.",
          category: "Design",
          tags: ["design", "uiux", "css", "figma"],
          description: "<h2>Elevating User Delight</h2><p>A great digital product doesn't just work; it charms. By utilizing HSL color harmony, refined typography scales, and fluid layout motion, we transform static interfaces into captivating digital canvas.</p>",
          image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
          author: admin._id,
          isPublished: true,
          isPinned: true,
          views: 980,
          likes: 28
        },
        {
          title: "Building Resilient Mobile Applications with React & Capacitor",
          subTitle: "Step-by-step blueprint for wrapping React single page applications into high-performance Android APKs.",
          category: "Mobile",
          tags: ["mobile", "android", "capacitor", "react"],
          description: "<h2>Cross-Platform Mobile Mastery</h2><p>Learn how to harness native device APIs, local persistent storage, offline sync, and push notifications directly within your React codebase using Capacitor.</p>",
          image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&auto=format&fit=crop&q=80",
          author: author._id,
          isPublished: true,
          views: 750,
          likes: 19
        }
      ];

      await Blog.insertMany(sampleBlogs);
      console.log("✨ Seeded sample blog posts successfully!");
    }
  } catch (err) {
    console.error("⚠️ Auto-seeding database warning:", err.message);
  }
}
