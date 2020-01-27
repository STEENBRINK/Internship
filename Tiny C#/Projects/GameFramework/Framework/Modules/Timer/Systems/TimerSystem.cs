using Unity.Entities;
using Unity.Tiny.Core;

namespace Modules.Timer
{
    public class TimerSystem: ComponentSystem
    {
        /// <summary>
        /// Updates the timer if it is not paused
        /// </summary>
        protected override void OnUpdate()
        {
            Entities.ForEach((ref Timer timer) =>
            {
                if (timer.isPaused || timer.isMarkedDone) return;
                if (timer.countType == CountType.Down)
                {
                    if (timer.currentTime <= 0)
                    {
                        timer.currentTime = 0;
                        timer.isMarkedDone = true;
                    }
                    else
                    {
                        timer.currentTime -= World.TinyEnvironment().frameDeltaTime;
                    }
                }
                else
                {
                    if (timer.currentTime >= timer.maxTime)
                    {
                        timer.currentTime = timer.maxTime;
                        timer.isMarkedDone = true;
                    }
                    else
                    {
                        timer.currentTime += World.TinyEnvironment().frameDeltaTime;
                    }
                }
            });
        }

        /// <summary>
        /// pauses the timer
        /// </summary>
        /// <param name="ID">The ID of the timer</param>
        /// <param name="entities">A reference to the EntityQueryBuilder instance</param>
        public static void PauseTimer(uint ID, EntityQueryBuilder entities)
        {
            entities.ForEach((ref Timer timer) =>
            {
                if (timer.ID == ID)
                {
                    timer.isPaused = true;
                }
            });
        }
        
        /// <summary>
        /// resumes the timer
        /// </summary>
        /// <param name="ID">The ID of the timer</param>
        /// <param name="entities">A reference to the EntityQueryBuilder instance</param>
        public static void ResumeTimer(uint ID, EntityQueryBuilder entities)
        {
            entities.ForEach((ref Timer timer) =>
            {
                if (timer.ID == ID)
                {
                    timer.isPaused = false;
                }
            });
        }
        
        /// <summary>
        /// resets the timer
        /// </summary>
        /// <param name="ID">The ID of the timer</param>
        /// <param name="entities">A reference to the EntityQueryBuilder instance</param>
        public static void ResetTimer(uint ID, EntityQueryBuilder entities)
        {
            entities.ForEach((ref Timer timer) =>
            {
                if (timer.ID != ID) return;
                if (timer.countType == CountType.Down)
                {
                    timer.currentTime = timer.maxTime;
                    timer.isMarkedDone = false;
                }
                else
                {
                    timer.currentTime = 0;
                    timer.isMarkedDone = false;
                }
            });
        }

        /// <summary>
        /// pauses all timers
        /// </summary>
        /// <param name="entities">A reference to the EntityQueryBuilder instance</param>
        public static void PauseAllTimers(EntityQueryBuilder entities)
        {
            entities.ForEach((ref Timer timer) =>
            {
                timer.isPaused = true;
            });
        }
        
        /// <summary>
        /// resumes all timers
        /// </summary>
        /// <param name="entities">A reference to the EntityQueryBuilder instance</param>
        public static void ResumeAllTimers(EntityQueryBuilder entities)
        {
            entities.ForEach((ref Timer timer) =>
            {
                timer.isPaused = false;
            });
        }
        
        /// <summary>
        /// resets all timers
        /// </summary>
        /// <param name="entities">A reference to the EntityQueryBuilder instance</param>
        public static void ResetAllTimers(EntityQueryBuilder entities)
        {
            entities.ForEach((ref Timer timer) =>
            {
                if (timer.countType == CountType.Down)
                {
                    timer.currentTime = timer.maxTime;
                    timer.isMarkedDone = false;
                }
                else
                {
                    timer.currentTime = 0;
                    timer.isMarkedDone = false;
                }
            });
        }

        /// <summary>
        /// set the maxTime for a timer
        /// </summary>
        /// <param name="ID">The ID of the timer</param>
        /// <param name="entities">A reference to the EntityQueryBuilder instance</param>
        /// <param name="time">The max time to set the timer to</param>
        public static void SetMaxTime(uint ID, EntityQueryBuilder entities, float time)
        {
            entities.ForEach((ref Timer timer) =>
            {
                if(timer.ID == ID)
                    timer.maxTime = time;
            });
        }

        /// <summary>
        /// returns weather the timer is finished or not
        /// </summary>
        /// <param name="ID">The ID of the timer</param>
        /// <param name="entities">A reference to the EntityQueryBuilder instance</param>
        /// <returns>(bool) weather or not the timer is finished</returns>
        public static bool IsDone(uint ID, EntityQueryBuilder entities)
        {
            bool returnValue = false;
            entities.ForEach((ref Timer timer) =>
            {
                if (timer.ID == ID)
                {
                    returnValue =  timer.isMarkedDone;
                }
            });
            return returnValue;
        }
    }
}