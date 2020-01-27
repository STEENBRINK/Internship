using Unity.Entities;

namespace Modules.AudioHandler.Core
{
    public struct StopAudio: IComponentData
    {
        public uint ID;
    }
}