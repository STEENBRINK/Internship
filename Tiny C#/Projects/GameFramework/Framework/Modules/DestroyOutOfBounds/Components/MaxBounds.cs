using Unity.Entities;
using Unity.Mathematics;

namespace Modules.DestroyOutOfBounds
{
    public struct MaxBounds: IComponentData
    {
        public float2 maxBoundsCenterPos;
        public float2 maxBoundsSize;
    }
}