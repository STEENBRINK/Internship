using System;

namespace Modules.SceneHandling.FlowHandling
{
    public class MultipleFlowsFoundException: Exception
    {
        public MultipleFlowsFoundException():
            base(String.Format("Multiple Flow components were found")) {}
    }
}