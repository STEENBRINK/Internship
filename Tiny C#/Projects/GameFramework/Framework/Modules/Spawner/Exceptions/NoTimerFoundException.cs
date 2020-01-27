using System;

namespace Modules.Spawner
{
    [Serializable]
    public class NoTimerFoundException: Exception
    {
        public NoTimerFoundException():
            base(String.Format("You added a timed spawner without a timer")){}
        
        
        public NoTimerFoundException(uint ID):
            base(String.Format("You added a timed spawner without a timer, Spawner ID: " + ID )){}
    }
}