import time
from infra.logger import Logger

logger = Logger()


def timer_wrapper(enabled=True):
    def decorator(func):
        def wrapper(*args, **kwargs):
            start_time = time.time() * 1000
            result = func(*args, **kwargs)
            end_time = time.time() * 1000
            cost = "{:.4f}".format(end_time - start_time)
            logger.normal_log.info(f"Function {func.__name__} took {cost} milliseconds to run.[args={args[1:]}, kwargs={kwargs}]")
            return result
        return wrapper
    return decorator