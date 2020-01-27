using Unity.Entities;

namespace Modules.AudioHandler.AudioSorting
{
    public struct StopAudioType: IComponentData
    {
    public AudioTypes type;
    }
}