using Unity.Entities;

namespace Modules.AudioHandler.AudioSorting
{
    public struct StartAudioType: IComponentData
    {
        public AudioTypes type;
    }
}