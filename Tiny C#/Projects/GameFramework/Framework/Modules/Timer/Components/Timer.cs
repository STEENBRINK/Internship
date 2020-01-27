using Modules.Timer;
using Unity.Entities;

namespace Modules.Timer
{
    public struct Timer: IComponentData
    {
        public uint ID;
        public CountType countType;
        public float maxTime;
        public float currentTime;
        public bool isPaused;
        public bool isMarkedDone;
    }
}