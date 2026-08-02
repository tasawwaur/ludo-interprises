import { AnimationTask } from '../types';

export class AnimationController {
  private queue: AnimationTask[] = [];
  private activeTask: AnimationTask | null = null;
  private isProcessing = false;
  private lastTickTime = 0;
  private frameId: number | null = null;
  private startTime = 0;

  /**
   * Enqueues a new animation task and triggers execution.
   */
  public enqueue(task: AnimationTask): void {
    this.queue.push(task);
    // Sort queue by priority (CRITICAL > HIGH > NORMAL > LOW)
    this.queue.sort((a, b) => {
      const priorityMap = { CRITICAL: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
      return priorityMap[b.priority] - priorityMap[a.priority];
    });

    // Interrupt current task if a higher priority critical task arrives
    if (this.activeTask && task.priority === 'CRITICAL' && this.activeTask.priority !== 'CRITICAL') {
      this.interruptActiveTask();
    }

    if (!this.isProcessing) {
      this.processNext();
    }
  }

  /**
   * Interrupts/cancels the current executing task and advances to next.
   */
  public interruptActiveTask(): void {
    if (this.activeTask) {
      if (this.activeTask.onCancel) {
        this.activeTask.onCancel();
      }
      this.activeTask = null;
    }
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.isProcessing = false;
    this.processNext();
  }

  /**
   * Clears all pending animation tasks in the queue.
   */
  public clearAll(): void {
    this.queue.forEach((t) => {
      if (t.onCancel) t.onCancel();
    });
    this.queue = [];
    this.interruptActiveTask();
  }

  private processNext(): void {
    if (this.queue.length === 0) {
      this.activeTask = null;
      this.isProcessing = false;
      return;
    }

    this.activeTask = this.queue.shift() || null;
    if (!this.activeTask) return;

    this.isProcessing = true;
    this.startTime = Date.now();
    this.lastTickTime = this.startTime;

    this.tick();
  }

  private tick = (): void => {
    if (!this.activeTask) return;

    const now = Date.now();
    const elapsed = now - this.startTime;
    const progress = Math.min(1.0, elapsed / this.activeTask.durationMs);

    this.activeTask.onUpdate(progress);

    if (progress >= 1.0) {
      const completedTask = this.activeTask;
      this.activeTask = null;
      completedTask.onComplete();
      this.processNext();
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };
}
