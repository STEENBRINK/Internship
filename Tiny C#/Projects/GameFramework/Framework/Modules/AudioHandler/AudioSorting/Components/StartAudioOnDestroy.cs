using Unity.Entities;

namespace Modules.AudioHandler.AudioSorting
{
    public struct StartAudioOnDestroy: IComponentData
    {
        public AudioTypes type;
    }
}