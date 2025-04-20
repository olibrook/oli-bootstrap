import { motion, AnimatePresence } from 'framer-motion';

export const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="bg-base-200 absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          <div className={`text-base-content/65 flex items-center justify-center`} aria-label="Loading" role="status">
            <span className="loading loading-spinner loading-xl"></span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
