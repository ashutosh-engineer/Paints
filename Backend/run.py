import uvicorn
import os
import sys

# Ensure backend root is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # Use multiple workers in both dev and prod to ensure concurrency support
    # for simultaneous requests from App and Desktop.
    
    # Check OS to determine stability settings
    import platform
    is_windows = platform.system() == "Windows"
    
    # On Windows with Python 3.14 (Preview), multiprocessing with Uvicorn can be unstable.
    # We fallback to 1 worker on Windows to prevent crashes, while maintaining 4 for Linux/Production.
    if is_windows:
        print("⚠️  Windows detected: Forcing workers=1 for stability with Python 3.14")
        print("ℹ️  Concurrency will be handled via threads (ThreadPool) instead of processes.")
        workers = 1
        # Explicitly ignore CancelledError that might occur on Windows loop shutdown
        # and prevent KeyboardInterrupt stack traces
        try:
            uvicorn.run("app.main:app", host="0.0.0.0", port=8000, workers=workers)
        except (KeyboardInterrupt, SystemExit):
            pass
        except Exception as e:
            # Catch asyncio cancelled error if passing strictly
            if "CancelledError" not in str(type(e)):
                raise e
    else:
        workers = int(os.getenv("WEB_CONCURRENCY", 4))
        uvicorn.run("app.main:app", host="0.0.0.0", port=8000, workers=workers)
