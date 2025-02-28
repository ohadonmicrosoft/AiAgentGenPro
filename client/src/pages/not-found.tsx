import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Home } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function NotFoundPage() {
  const { user } = useAuth();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        className="max-w-md"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="relative mx-auto mb-8 h-40 w-40"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full border-b-4 border-t-4 border-primary/30"
          ></motion.div>
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: -360 }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-4 rounded-full border-b-4 border-r-4 border-primary/40"
          ></motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl font-bold text-primary">404</span>
          </div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="mb-4 text-3xl font-bold tracking-tight"
        >
          Page Not Found
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mb-8 text-muted-foreground"
        >
          Sorry, we couldn't find the page you're looking for. The page might
          have been moved, deleted, or never existed.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0"
        >
          <Button asChild size="lg">
            <Link href={user ? "/dashboard" : "/"}>
              <Home className="mr-2 h-4 w-4" />
              {user ? "Back to Dashboard" : "Go to Homepage"}
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="#">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
