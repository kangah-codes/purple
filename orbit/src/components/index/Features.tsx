import Image from 'next/image';

export default function Features() {
    return (
        <div className='w-full bg-white'>
            <div className='w-full max-w-xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl py-20 mx-auto px-5 flex flex-col space-y-10'>
                <div className='flex flex-col mx-auto text-center w-full col-span-2 space-y-2 max-w-2xl'>
                    <h1 className='font-bold text-5xl'>Insert header</h1>
                    <p className='text-lg text-black'>
                        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nisi nesciunt a,
                        provident quaerat similique dolore! Earum, eaque molestiae autem dolor, quos
                        eveniet doloribus magni ullam temporibus eligendi, dolores dignissimos
                        deleniti?
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 w-full gap-5'>
                    <div className='flex flex-col overflow-hidden bg-purple-100 rounded-[3rem] p-5 lg:p-10 border border-purple-100 bg-opacity-80 backdrop-blur'>
                        <div className='px-5 2xl:px-8 text-black text-center flex'>
                            <div className='flex flex-col mx-auto max-w-sm w-full'>
                                <h1 className='inline text-4xl tracking-tight font-bold'>
                                    Products
                                </h1>
                                <p className='text-black text-base'>
                                    Our developer API platform provides access to over a thousand
                                    insurance products, enabling developers to leverage a powerful
                                    suite of tools for their integration needs.
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center pt-5 h-full justify-center'>
                            <div className='mx-auto w-[300px] h-[300px]'>
                                <Image
                                    alt='computer-crash'
                                    loading='lazy'
                                    width={100}
                                    height={100}
                                    objectFit='cover'
                                    className='w-full h-full top-0 left-0 object-cover rounded-2xl'
                                    src='/graphics/computer-crash.png'
                                />
                            </div>
                        </div>
                    </div>

                    <div className='w-full h-[400px] border border-purple-200 rounded-3xl flex flex-col overflow-hidden shadow-lg shadow-purple-100'>
                        <div className='h-[70%] bg-gradient-to-br from-purple-100 to-purple-200'></div>
                        <div className='flex flex-col p-5 space-y-2'>
                            <h2 className='font-semibold text-2xl'>Card Header</h2>
                            <p className='font-medium text-sm'>
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti
                                optio exercitationem officiis quod, aperiam doloribus molestiae
                                iusto, esse magni sit, vel odit incidunt magnam error nesciunt nihil
                                doloremque excepturi repellat?
                            </p>
                        </div>
                    </div>
                    <div className='w-full h-[400px] border border-purple-200 rounded-3xl flex flex-col overflow-hidden shadow-lg shadow-purple-100'>
                        <div className='h-[70%] bg-gradient-to-br from-purple-100 to-purple-200'></div>
                        <div className='flex flex-col p-5 space-y-2'>
                            <h2 className='font-semibold text-2xl'>Card Header</h2>
                            <p className='font-medium text-sm'>
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti
                                optio exercitationem officiis quod, aperiam doloribus molestiae
                                iusto, esse magni sit, vel odit incidunt magnam error nesciunt nihil
                                doloremque excepturi repellat?
                            </p>
                        </div>
                    </div>
                    <div className='w-full h-[400px] border border-purple-200 rounded-3xl flex flex-col overflow-hidden shadow-lg shadow-purple-100'>
                        <div className='h-[70%] bg-gradient-to-br from-purple-100 to-purple-200'></div>
                        <div className='flex flex-col p-5 space-y-2'>
                            <h2 className='font-semibold text-2xl'>Card Header</h2>
                            <p className='font-medium text-sm'>
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti
                                optio exercitationem officiis quod, aperiam doloribus molestiae
                                iusto, esse magni sit, vel odit incidunt magnam error nesciunt nihil
                                doloremque excepturi repellat?
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
