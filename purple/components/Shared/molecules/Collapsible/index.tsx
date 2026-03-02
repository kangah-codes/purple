import { CollapsibleRoot } from './CollapsibleRoot';
import { CollapsibleTrigger } from './CollapsibleTrigger';
import { CollapsibleContent } from './CollapsibleContent';
import { useCollapsibleContext } from './CollapsibleContext';

export const Collapsible = {
    Root: CollapsibleRoot,
    Trigger: CollapsibleTrigger,
    Content: CollapsibleContent,
    useContext: useCollapsibleContext,
};

export { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent, useCollapsibleContext };
