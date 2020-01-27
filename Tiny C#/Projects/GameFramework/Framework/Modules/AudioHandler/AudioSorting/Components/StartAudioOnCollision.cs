using Unity.Entities;

namespace Modules.AudioHandler.AudioSorting
{
    public struct StartAudioOnCollision: IComponentData
    {
        public AudioTypes type;
    }
}